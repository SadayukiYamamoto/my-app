///MyPage.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  setDoc,
  deleteField,
  deleteDoc
} from "firebase/firestore";
import "./Mypage.css";
import { ExitToApp, Edit } from "@mui/icons-material";
import { FaRegCommentDots, FaRetweet, FaHeart, FaPlus } from 'react-icons/fa';
import DigitScroller from "./DigitScroller";
import { onAuthStateChanged } from "firebase/auth"; // ✅ 忘れずに追加
import PostContent from "../components/PostContent";
import ReactionBar from "../components/ReactionBar";
import CommentBottomSheet from "../components/CommentBottomSheet";
import MoreMenu from "../components/MoreMenu";
import BadgeItem from "../components/BadgeItem";

const getDigitArray = (num) => {
  const str = num.toString();
  return str.split("").map(Number);
};


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

const MyPage = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [likedPostIds, setLikedPostIds] = useState([]);
  const [commentedPostIds, setCommentedPostIds] = useState([]);
  const [badges, setBadges] = useState([]);
  const [reactedPosts, setReactedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("post");
  const [expandedPosts, setExpandedPosts] = useState({});
  const [animatePoint, setAnimatePoint] = useState(false);
  const [displayedPoint, setDisplayedPoint] = useState(0);
  const [openCommentBox, setOpenCommentBox] = useState(null);
const [comments, setComments] = useState([]);
const [reactionData, setReactionData] = useState({});
const [showSheetPost, setShowSheetPost] = useState(null);
const [myTreasurePosts, setMyTreasurePosts] = useState([]);
const [userPoint, setUserPoint] = useState(0);

  const navigate = useNavigate();
  const { userId } = useParams();
  const viewingOwnPage = !userId || (user && user.uid === userId);
  const uidToUse = viewingOwnPage ? user?.uid : userId;

  useEffect(() => {
    if (activeTab === "point") {
      setAnimatePoint(false);
      const timeout = setTimeout(() => setAnimatePoint(true), 10);
      return () => clearTimeout(timeout);
    }
  }, [activeTab]);
  
  useEffect(() => {
    if (animatePoint) {
      let start = 0;
      const end = userPoint;
      const duration = 1000;
      const stepTime = 150;
      const totalSteps = duration / stepTime;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        const progress = step / totalSteps;
        const current = Math.floor(progress * end);
        setDisplayedPoint(current);
        if (step >= totalSteps) {
          clearInterval(interval);
          setDisplayedPoint(end);
        }
      }, stepTime);
      return () => clearInterval(interval);
    }
  }, [animatePoint, userPoint]);

  useEffect(() => {
    const fetchMyTreasurePosts = async () => {
      if (!uidToUse) return;
      const q = query(collection(db, "TresurePost"), where("userId", "==", uidToUse));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyTreasurePosts(data);
    };
  
    fetchMyTreasurePosts();
  }, [uidToUse]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        console.warn("🚫 未ログイン状態です");
        navigate("/login");
        return;
      }
  
      const uid = !userId || currentUser.uid === userId ? currentUser.uid : userId;
  
      if (!uid) {
        console.warn("⚠️ uidがありません");
        return;
      }
  
      fetchData(uid);
    });
  
    return () => unsubscribe();
  }, [userId]);

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
          if (user && userId === user.uid) {
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
  
  
  const fetchData = async (uid) => {
    try {
      console.log("fetchData開始 UID:", uid);
  
      // 🔽 プロフィール取得
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.warn("⚠️ プロフィールが存在しません");
        return;
      }
      const profileData = docSnap.data();
setProfile(profileData);
setUserPoint(profileData.point || 0); // ←ここを追加
  
      // 🔽 投稿取得
      const postsSnap = await getDocs(query(
        collection(db, "posts"),
        where("userId", "==", uid)
      ));
      console.log("✅ 投稿数:", postsSnap.docs.length);
      const postData = await Promise.all(postsSnap.docs.map(async docSnap => {
        const data = docSnap.data();
        const commentSnap = await getDocs(collection(db, "posts", docSnap.id, "comments"));
        const commentCount = commentSnap.size;
      
        // 元の投稿があるかどうかをチェック
        let originalPost = null;
        if (data.repostOf) {
          const originalSnap = await getDoc(doc(db, "posts", data.repostOf));
          if (originalSnap.exists()) {
            originalPost = originalSnap.data();
          }
        }
      
        const userSnap = await getDoc(doc(db, "users", data.userId));
        const userData = userSnap.exists() ? userSnap.data() : {};
      
        return {
          id: docSnap.id,
          ...data,
          commentCount,
          repostOriginal: originalPost, // ← 追加
          user: {
            displayName: userData.displayName || "匿名",
            userName: userData.userName || "unknown",
            profileImage: userData.profileImage || "/default-avatar.png"
          }
        };
      }));
      
      setUserPosts(postData);
      await Promise.all(postData.map(post => refreshReactions(post.id)));

      // 🔽 自分のコメント付き投稿の詳細も取得する
const userCommentsSnap = await getDocs(query(collection(db, "comments"), where("userId", "==", uid)));

const commentDetails = await Promise.all(userCommentsSnap.docs.map(async commentDoc => {
  const commentData = commentDoc.data();
  const postRef = doc(db, "posts", commentData.postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) return null;

  const postData = postSnap.data();
  const userRef = doc(db, "users", postData.userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.exists() ? userSnap.data() : {};

  return {
    postId: commentData.postId,
    comment: commentData.text,
    createdAt: commentData.createdAt,
    postTitle: postData.title || "無題",
    postUser: {
      displayName: userData.displayName || "匿名",
      userName: userData.userName || "unknown",
      profileImage: userData.profileImage || "/default-avatar.png"
    }
  };
}));

setCommentedPostIds(commentDetails.filter(Boolean));
console.log("🧾 コメント履歴データ", commentDetails.filter(Boolean));
  
      // 🔽 バッジ取得
      const badgesSnap = await getDocs(query(collection(db, "badges"), where("userId", "==", uid)));
      console.log("検索するUID:", uid);
console.log("FirestoreのuserId:", badgesSnap.docs.map(doc => doc.data().userId));
      console.log("✅ バッジ数:", badgesSnap.docs.length);
      setBadges(badgesSnap.docs.map(doc => doc.data()));
      const allBadgesSnap = await getDocs(collection(db, "badges"));
console.log("バッジ一覧", allBadgesSnap.docs.map(doc => doc.data()));
  
      setLoading(false);
      console.log("✅ fetchData 完了");
    } catch (err) {
      console.error("🔥 Firestore取得エラー:", err.code, err.message, err);
    }
  };
  

  const toggleExpand = (postId) => {
    setExpandedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  if (!uidToUse) return <p>ログインしてください。</p>;
  if (loading) return <p>プロフィール情報を読み込み中...</p>;

  const handleLogout = () => {
    auth.signOut().then(() => navigate("/login"));
  };

  const handleCommentClick = async (postId) => {
    const snap = await getDocs(collection(db, 'posts', postId, 'comments'));
    const commentData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setComments(commentData);
    setShowSheetPost(postId);
  };
  
  const handleCloseCommentSheet = () => {
    setShowSheetPost(null);
  };
  
  const handleSubmitComment = async (text) => {
    if (!user || !showSheetPost) return;
  
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const profile = userSnap.exists() ? userSnap.data() : {};
  
    const commentData = {
      text,
      createdAt: new Date(),
      userId: user.uid,
      displayName: profile.displayName || "匿名",
      userName: profile.userName || "unknown",
      profileImage: profile.profileImage || "/default-avatar.png"
    };
  
    // ✅ 投稿側に保存（今まで通り）
    await addDoc(collection(db, "posts", showSheetPost, "comments"), commentData);
  
    // ✅ 🔥 新規追加：履歴用にルートにも保存！
    await addDoc(collection(db, "comments"), {
      ...commentData,
      postId: showSheetPost
    });
  
    // コメント一覧を更新
    const snap = await getDocs(collection(db, 'posts', showSheetPost, 'comments'));
    const updated = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setComments(updated);
  };
  
  
  const handleToggleReaction = async (postId, type) => {
    if (!user) {
      alert("ログインが必要です！");
      return;
    }
  
    const reactionRef = doc(db, "posts", postId, "reactions", user.uid);
    const post = userPosts.find(p => p.id === postId);
  
    try {
      const snapshot = await getDoc(reactionRef);
      const currentData = snapshot.exists() ? snapshot.data() : {};
      const alreadyReacted = !!currentData[type];
  
      if (alreadyReacted) {
        await updateDoc(reactionRef, { [type]: deleteField() });
      } else {
        await updateDoc(reactionRef, {
          [type]: true,
          userId: user.uid
        }, { merge: true });
  
        if (post && post.userId !== user.uid) {
          await addDoc(collection(db, "notifications"), {
            type: type,
            postId: postId,
            fromUserId: user.uid,
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

  const handleDelete = async (postId) => {
    if (!window.confirm("この投稿を削除しますか？")) return;
    try {
      await deleteDoc(doc(db, "posts", postId));
      setUserPosts(prev => prev.filter(post => post.id !== postId));
      alert("削除しました！");
    } catch (error) {
      console.error("削除エラー:", error);
    }
  };
  
  const handleRepost = async (post) => {
    if (!user) return alert("ログインが必要です！");
    const postId = post.repostOf || post.id;
    const reactionRef = doc(db, "posts", postId, "reactions", user.uid);
  
    try {
      const snapshot = await getDoc(reactionRef);
      const currentData = snapshot.exists() ? snapshot.data() : {};
      const alreadyReacted = !!currentData["repost"];
  
      if (alreadyReacted) {
        await updateDoc(reactionRef, { repost: deleteField() });
      } else {
        await setDoc(reactionRef, {
          repost: true,
          userId: user.uid
        });
  
        if (post && post.userId !== user.uid) {
          await addDoc(collection(db, "notifications"), {
            type: "repost",
            postId,
            fromUserId: user.uid,
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



  return (
    <div className="mypage-container">
      <div className="mypage-card">
  <div className="mypage-banner">
    <img src={profile?.headerImage || "/default-header.jpg"} alt="ヘッダー画像" className="mypage-header-image" />
  </div>

  {/* 編集ボタン：この位置に挿入 */}
  <div className="mypage-edit-button-fixed">
    <Link to="/profile-edit" className="mypage-edit-button">
      <Edit className="mypage-icon" /> プロフィール編集
    </Link>
  </div>

        <div className="mypage-profile">
          <img src={profile?.profileImage || "https://picsum.photos/150"} alt="プロフィール" className="mypage-profile-image" />
        </div>

        <div className="mypage-name-area">
        <h2 className="mypage-displayname">{profile?.displayName || "名無し"}</h2>
        <p className="mypage-username">@{profile?.userName || "user"}</p>
      </div>

      <div className="mypage-profile-extra">
  {profile?.storeNames?.length > 0 && (
    <p><strong>店舗名:</strong> {profile.storeNames.join(" / ")}</p>
  )}
  {profile?.hobbies?.length > 0 && (
    <p><strong>趣味:</strong> {profile.hobbies.join(" / ")}</p>
  )}
  {profile?.introduction && (
    <p><strong>自己紹介:</strong> {profile.introduction}</p>
  )}
</div>

        <div className="mypage-tabs">
          <span onClick={() => setActiveTab("post" )} className={activeTab === "post" ? "active" : ""}>ポスト</span>
          <span onClick={() => setActiveTab("badge" )} className={activeTab === "badge" ? "active" : ""}>バッジ</span>
          <span onClick={() => setActiveTab("tresure" )} className={activeTab === "tresure" ? "active" : ""}>ノウハウ</span>
          <span onClick={() => setActiveTab("point" )} className={activeTab === "point" ? "active" : ""}>ポイント</span>
        </div>

        <div className="mypage-tab-content">
        <div className={`tab-panel ${activeTab === "post" ? "active" : ""}`}>
  <h3 className="mypage-subheader">自分の投稿</h3>
  {userPosts.length > 0 ? userPosts.map(post => {
    return (
      <div key={post.id} className="post-card">
          <MoreMenu
    post={post}
    currentUserId={user?.uid}
    onEdit={() => navigate(`/post?edit=${post.id}`)}
    onDelete={() => handleDelete(post.id)}
    onTogglePin={() => {}} // 固定機能は不要なら空でOK
  />

        <div className="post-user-info">
          <div className="post-user-info-left">
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
    <p className="repost-label">🔁 リポストした投稿</p>
    <PostContent
      post={post.repostOriginal}
      isExpanded={!!expandedPosts[post.id]}
      onToggleExpand={() => toggleExpand(post.id)}
    />
  </div>
) : (
  <PostContent
    post={post}
    isExpanded={!!expandedPosts[post.id]}
    onToggleExpand={() => toggleExpand(post.id)}
  />
)}


        <ReactionBar
          post={post}
          reactions={reactionData[post.id]}
          onToggleComment={() => handleCommentClick(post.id)}
          onToggleReaction={handleToggleReaction}
          onRepost={handleRepost}
          commentCount={post.commentCount}
        />

        {showSheetPost === post.id && (
          <CommentBottomSheet
            user={user}
            comments={comments}
            onClose={handleCloseCommentSheet}
            onSubmit={handleSubmitComment}
          />
        )}
      </div>
    );
  }) : <p>投稿がありません</p>}
</div>

<div className={`tab-panel ${activeTab === "comment" ? "active" : ""}`}>
  <h3 className="mypage-subheader">コメントした投稿</h3>
  {commentedPostIds.length > 0 ? (
    <div className="comment-list">
      {commentedPostIds.map((item, idx) => (
        <div key={idx} className="comment-card">
          <div className="post-user-info">
            <img src={item.postUser.profileImage} alt="User Avatar" className="user-avatar" />
            <div className="user-info-text">
              <strong>{item.postUser.displayName}</strong>
              <p className="username">@{item.postUser.userName}</p>
            </div>
            <span className="post-user-info-meta">{formatTimeAgo(item.createdAt)}</span>
          </div>
          <p className="comment-on">💬 {item.postTitle} へのコメント</p>
          <div className="comment-body">
            {item.comment}
          </div>
        </div>
      ))}
    </div>
  ) : <p>コメント履歴がありません</p>}
</div>

<div className={`tab-panel ${activeTab === "badge" ? "active" : ""}`}>
  <h3 className="mypage-subheader">バッジ</h3>
  <div className="badge-list" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
    {badges.length > 0 ? badges.map((badge, idx) => (
      <BadgeItem key={idx} imageUrl={badge.imageUrl} badgeName={badge.badgeName} />
    )) : <p>バッジなし</p>}

            </div>
          </div>


          <div className={`tab-panel ${activeTab === "tresure" ? "active" : ""}`}>
  <h3 className="mypage-subheader">自分のノウハウ投稿</h3>
  {myTreasurePosts.length > 0 ? (
    myTreasurePosts.map(post => (
      <div key={post.id} className="post-card" onClick={() => navigate(`/treasure/${encodeURIComponent(post.category)}/${post.id}`)}>
        <div className="post-user-info">
          <img src={post.profileImage || "/default-avatar.png"} alt="User" className="user-avatar" />
          <div className="user-info-text">
            <strong>{post.displayName}</strong>
            <p className="username">@{post.userName}</p>
          </div>
        </div>
        <div className="post-content-preview">
          <h4>{post.title || '（無題）'}</h4>
          <p dangerouslySetInnerHTML={{ __html: post.text.slice(0, 100) + "..." }} />
        </div>
      </div>
    ))
  ) : (
    <p>ノウハウ投稿がありません</p>
  )}
</div>

          <div className={`tab-panel ${activeTab === "point" ? "active" : ""}`}>
          <h3 className="mypage-subheader">保有ポイント</h3>
          <div
            className={`point-display ${animatePoint ? "animated-point" : ""}`}
            onClick={() => {
              setAnimatePoint(false);
              void requestAnimationFrame(() => setAnimatePoint(true));
            }}
            style={{ textAlign: "right" }}
          >
<div className="point-value">
  {getDigitArray(displayedPoint).map((d, idx) => (
    <DigitScroller key={idx} digit={d} />
  ))} <span className="point-unit">S-point</span>
</div>
            <div className={`point-underline ${animatePoint ? "slide-line" : ""}`} style={{ marginLeft: "auto", marginRight: "0" }} />
            <div className="point-glow" />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;