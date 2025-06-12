// src/pages/Pitter.js
import 'react-quill/dist/quill.snow.css';
import './Pitter.css';
import React, { useEffect, useState, useRef, memo } from 'react';
import { db, collection, getDocs, doc, getDoc, setDoc, deleteDoc, updateDoc, addDoc } from '../firebase';
import { auth } from '../firebase';
import { deleteField } from 'firebase/firestore'; // 🔥 これを追加！
import MoreMenu from '../components/MoreMenu';
import { useNavigate } from 'react-router-dom';
import { FaRegCommentDots, FaRetweet, FaHeart, FaPlus } from 'react-icons/fa';
import ReactionBar from '../components/ReactionBar';
import CommentBottomSheet from '../components/CommentBottomSheet';

const CATEGORIES = [
  "クスッと笑っちゃった", "良かったこと", "プチ自慢", "お悩み相談",
  "お客様のご要望", "雑談", "今日のペット", "競馬予想", "推し活",
  "飯テロ", "バナー応募！", "お知らせ", "本日の記事", "気軽に一言"
];


const formatTimeAgo = (timestamp) => {
  if (!timestamp?.seconds) return '';
  const now = new Date();
  const then = new Date(timestamp.seconds * 1000);
  const diff = (now - then) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}日前`;
  return then.toLocaleDateString();
};

const PostContent = memo(({ post, isExpanded, onToggleExpand }) => {
  const content = post.content || "";
  const contentRef = useRef(null);
  const [needsTruncate, setNeedsTruncate] = useState(false);

  useEffect(() => {
    if (contentRef.current && !isExpanded) {
      const maxHeight = 104; // 約6em = 3行分
      setNeedsTruncate(contentRef.current.scrollHeight > maxHeight);
    }
  }, [content, isExpanded]);

  return (
    <>
      <div className={`post-content-wrapper ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div
          className="post-content ql-editor"
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
      {!isExpanded && needsTruncate && (
        <div className="read-more-wrapper">
          <button className="read-more-button" onClick={onToggleExpand}>
            もっと見る
          </button>
        </div>
      )}
    </>
  );
});

const Pitter = ({ scrollDirection, setShowBottomBar }) => {
  const [showSheetPost, setShowSheetPost] = useState(null); // コメントシートを開く投稿
const [comments, setComments] = useState([]);
  console.log("✅ scrollDirection:", scrollDirection);
  const [posts, setPosts] = useState([]);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [reactionData, setReactionData] = useState({});
  const [filteredCategory, setFilteredCategory] = useState(null);
  const [filteredTag, setFilteredTag] = useState(null);
  const [openCommentBox, setOpenCommentBox] = useState(null);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const syncSidebarHeight = () => {
      const mainCol = document.querySelector('.pitter-main');
      const sidebar = document.querySelector('.pittersidebar');
      if (mainCol && sidebar) {
        sidebar.style.minHeight = `${mainCol.clientHeight}px`;
      }
    };
    syncSidebarHeight();
    window.addEventListener('resize', syncSidebarHeight);
    return () => window.removeEventListener('resize', syncSidebarHeight);
  }, []);

  const toggleExpand = (postId) => {
    setExpandedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const toggleCommentBox = (postId) => {
    setOpenCommentBox(prev => (prev === postId ? null : postId));
  };

  const handleClickPost = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleClickProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleEdit = (post) => navigate(`/post?edit=${post.id}`);

  const handleDelete = async (postId) => {
    if (!window.confirm("この投稿を削除しますか？")) return;
    try {
      await deleteDoc(doc(db, "posts", postId));
      const commentSnap = await getDocs(collection(db, "posts", postId, "comments"));
      await Promise.all(commentSnap.docs.map(docSnap =>
        deleteDoc(doc(db, "posts", postId, "comments", docSnap.id))
      ));
      setPosts(prev => prev.filter(post => post.id !== postId));
      alert("削除しました！");
    } catch (error) {
      console.error("削除エラー:", error);
    }
  };

  const handleSubmitComment = async (text) => {
    if (!auth.currentUser || !showSheetPost) return;
  
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    const profile = userSnap.exists() ? userSnap.data() : {};
  
    await addDoc(collection(db, "posts", showSheetPost, "comments"), {
      text,
      createdAt: new Date(),
      userId: auth.currentUser.uid,
      displayName: profile.displayName || auth.currentUser.displayName || "匿名",
      userName: profile.userName || "unknown",
      profileImage: profile.profileImage || "/default-avatar.png",
      parentId: null
    });
  
    const snap = await getDocs(collection(db, 'posts', showSheetPost, 'comments'));
    const updated = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setComments(updated);
    await refreshReactions(showSheetPost); // カウント更新
  };

  const togglePin = async (post) => {
    try {
      const updated = { ...post, pinned: !post.pinned };
      await updateDoc(doc(db, "posts", post.id), { pinned: updated.pinned });
      setPosts(prev =>
        prev.map(p => (p.id === post.id ? updated : p)).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
      );
    } catch (err) {
      console.error("固定切り替え失敗:", err);
    }
  };

  const handleRepost = async (post) => {
    if (!currentUser) return alert("ログインが必要です！");
    const postId = post.repostOf || post.id;
    const reactionRef = doc(db, "posts", postId, "reactions", currentUser.uid);
  
    try {
      const snapshot = await getDoc(reactionRef);
      const currentData = snapshot.exists() ? snapshot.data() : {};
      const alreadyReacted = !!currentData["repost"];
  
      if (alreadyReacted) {
        await updateDoc(reactionRef, { repost: deleteField() });
      } else {
        if (snapshot.exists()) {
          await updateDoc(reactionRef, {
            repost: true,
            userId: currentUser.uid
          }, { merge: true });
        } else {
          await setDoc(reactionRef, {
            repost: true,
            userId: currentUser.uid
          });
        }
  
        if (post && post.userId !== currentUser.uid) {
          await addDoc(collection(db, "notifications"), {
            type: "repost",
            postId,
            fromUserId: currentUser.uid,
            toUserId: post.userId,
            timestamp: new Date()
          });
        }
      }
  
      await refreshReactions(postId);
    } catch (err) {
      console.error("リポスト切り替え失敗:", err);
    }
  };
  
  
  

  const refreshReactions = async (postId) => {
    const [reactionSnap, commentSnap] = await Promise.all([
      getDocs(collection(db, "posts", postId, "reactions")),
      getDocs(collection(db, "posts", postId, "comments")),
    ]);
  
    const counts = {}, userReactions = {};
    reactionSnap.forEach(docSnap => {
      const data = docSnap.data();
      const userId = docSnap.id;
      for (const type in data) {
        if (data[type]) {
          counts[type] = (counts[type] || 0) + 1;
          if (currentUser && userId === currentUser.uid) {
            userReactions[type] = true;
          }
        }
      }
    });
  
    counts.comment = commentSnap.size;
  
    setReactionData(prev => ({
      ...prev,
      [postId]: { counts, userReactions }
    }));
  };
  
  
  

  const handleToggleReaction = async (postId, type) => {
    if (!currentUser) {
      alert("ログインが必要です！");
      return;
    }
  
    const reactionRef = doc(db, "posts", postId, "reactions", currentUser.uid);
    const post = posts.find(p => p.id === postId);
  
    try {
      const snapshot = await getDoc(reactionRef);
      const currentData = snapshot.exists() ? snapshot.data() : {};
      const alreadyReacted = !!currentData[type];
  
      if (alreadyReacted) {
        console.log("🧼 リアクション削除試行");
        await updateDoc(reactionRef, { [type]: deleteField() });
      } else {
        console.log("💡 リアクション追加試行");
        await updateDoc(reactionRef, {
          [type]: true,
          userId: currentUser.uid  // ← これを追加！！
        }, { merge: true });
  
        if (post && post.userId !== currentUser.uid) {
          await addDoc(collection(db, "notifications"), {
            type: type,
            postId: postId,
            fromUserId: currentUser.uid,
            toUserId: post.userId,
            timestamp: new Date()
          });
        }
      }
  
      await refreshReactions(postId);
    } catch (err) {
      console.error("リアクションエラー:", err);
    }
  };
  
  
  

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "posts"));
        const fetchedPosts = await Promise.all(querySnapshot.docs.map(async docSnap => {
          const postData = docSnap.data();
          const postId = docSnap.id;
        
          // 投稿者情報の取得（そのまま）
          let userProfile = { displayName: "匿名", userName: "unknown", profileImage: "/default-avatar.png" };
          if (postData.userId) {
            const userSnap = await getDoc(doc(db, "users", postData.userId));
            if (userSnap.exists()) {
              const userData = userSnap.data();
              userProfile = {
                displayName: userData.displayName || "匿名",
                userName: userData.userName || "unknown",
                profileImage: userData.profileImage || "/default-avatar.png"
              };
            }
          }
        
          // 🔽 コメント数を取得
          const commentSnap = await getDocs(collection(db, "posts", postId, "comments"));
          const commentCount = commentSnap.size;
        
          // 🔽 リポスト元の取得（そのまま）
          let originalPost = null;
          if (postData.repostOf) {
            const repostSnap = await getDoc(doc(db, "posts", postData.repostOf));
            if (repostSnap.exists()) {
              originalPost = repostSnap.data();
            }
          }

          return { id: docSnap.id, ...postData, userId: postData.userId, user: userProfile,repostOriginal: originalPost,commentCount};
        }));
        fetchedPosts.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
        setPosts(fetchedPosts);
        fetchAllReactions(fetchedPosts.map(post => post.id));
    } catch (error) {
        console.error("投稿の取得に失敗しました:", error);
    }
    };

    const fetchAllReactions = async (postIds) => {
      const allReactions = {};
      for (const postId of postIds) {
        const snapshot = await getDocs(collection(db, "posts", postId, "reactions"));
        const counts = {}, userReactions = {};
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          const userId = docSnap.id;
          for (const type of ['like', 'repost']) {
            if (data[type]) {
              counts[type] = (counts[type] || 0) + 1;
              if (currentUser && userId === currentUser.uid) {
                userReactions[type] = true;
              }
            }
          }
        });
        allReactions[postId] = { counts, userReactions };
      }
      setReactionData(allReactions);
    };

    fetchPosts();
  }, [currentUser]);

  const handleCommentClick = async (postId) => {
    const snap = await getDocs(collection(db, 'posts', postId, 'comments'));
    const commentData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setComments(commentData);
    setShowSheetPost(postId);
    setShowBottomBar(false); 
  };

  const handleCloseCommentSheet = () => {
    setShowSheetPost(null);
    setShowBottomBar(true); // ← BottomBar を戻す
  };

  let filteredPosts = posts;
  if (filteredCategory) filteredPosts = filteredPosts.filter(post => post.category === filteredCategory);
  if (filteredTag) filteredPosts = filteredPosts.filter(post => post.tags?.includes(filteredTag));

  return (
    <div className="pitter-layout">
    <div className={`pitter-header-wrapper ${scrollDirection === 'down' ? 'banner-hidden' : ''}`}>
  <img src="/pixtter-banner.png" alt="Pitter Banner" className="pitter-header-image" />
</div>
      <aside className="pittersidebar">
        {/* ← sidebar 内はそのままでOK */}
        <h3>カテゴリ</h3>

        <ul>
          <li className={!filteredCategory ? 'active' : ''} onClick={() => setFilteredCategory(null)}>すべて</li>
          {CATEGORIES.map(cat => (
            <li key={cat} className={filteredCategory === cat ? 'active' : ''} onClick={() => setFilteredCategory(cat)}>{cat}</li>
          ))}
        </ul>
        <div className="pittertagu">
          <h3>人気タグ</h3>
          <ul>
            <li className={!filteredTag ? 'active' : ''} onClick={() => setFilteredTag(null)}>すべて</li>
            {Array.from(new Set(posts.flatMap(post => post.tags || []))).map(tag => (
              <li key={tag} className={filteredTag === tag ? 'active' : ''} onClick={() => setFilteredTag(tag)}>{tag}</li>
            ))}
          </ul>
        </div>
      </aside>
      <main className="pitter-main">
        {filteredPosts.length === 0 ? (
          <p>投稿がありません。</p>
        ) : (
          filteredPosts.map((post) => (
            <div
  key={post.id}
  className="post-card"
  onClick={() => handleClickPost(post.id)}
  style={{ cursor: 'pointer' }}
>
              <MoreMenu
                post={post}
                currentUserId={auth.currentUser?.uid}
                onEdit={handleEdit}
                onDelete={() => handleDelete(post.id)}
                onTogglePin={() => togglePin(post)}
              />
              {post.imageUrl && (
                <img src={post.imageUrl} alt="投稿画像" className="post-image" />
              )}
              
              <div className="post-user-info">
  <div className="post-user-info-left" onClick={(e) => {
    e.stopPropagation();
    handleClickProfile(post.userId);
  }}>
    <img src={post.user.profileImage} alt="User Avatar" className="user-avatar" />
    <div className="user-info-text">
      <strong>{post.user.displayName}</strong>
      <p className="username">@{post.user.userName}</p>
    </div>
  </div>
  <span className="post-user-info-meta">{formatTimeAgo(post.createdAt)}</span>
</div>


{post.repostOriginal ? (
  <div className="original-post-card">
    <div dangerouslySetInnerHTML={{ __html: post.repostOriginal.content }} />
  </div>
) : (
  <>
    <PostContent
      post={post}
      isExpanded={!!expandedPosts[post.id]}
      onToggleExpand={() => toggleExpand(post.id)}
    />
  </>
)}

<ReactionBar
  post={post}
  reactions={reactionData[post.id]}
  onToggleComment={() => handleCommentClick(post.id)}
  onToggleReaction={handleToggleReaction}
  onRepost={handleRepost}
  commentCount={post.commentCount}
/>

{showSheetPost && (
  <CommentBottomSheet
    user={auth.currentUser}
    comments={comments}
    onClose={() => setShowSheetPost(null)}
    onSubmit={handleSubmitComment}
/>
)}
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default Pitter;
