import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, onSnapshot, setDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import ReactionBar from '../components/ReactionBar';
import styles from './TreasurePostDetail.module.css'; // ← 追加
import CommentBottomSheet from '../components/CommentBottomSheet'; // ←これを追加
import { FaEllipsisV } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';


export default function TreasurePostDetail() {
  const { category, postId } = useParams();
  const [post, setPost] = useState(null);
  const [reactions, setReactions] = useState({ counts: {}, userReactions: {} });
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComment, setShowComment] = useState(false); // ←これも追加
const [showMenu, setShowMenu] = useState(false);

  const user = auth.currentUser;
  const navigate = useNavigate();

  // 投稿取得
  useEffect(() => {
    const fetchPost = async () => {
      const docRef = doc(db, 'TresurePost', postId);
      const snap = await getDoc(docRef);
      if (snap.exists()) setPost({ id: snap.id, ...snap.data() });
    };
    fetchPost();
  }, [postId]);

  // リアクション取得
  useEffect(() => {
    const reactionsRef = collection(db, 'TresurePost', postId, 'reactions');
    const unsubscribe = onSnapshot(reactionsRef, (snapshot) => {
      let like = 0, repost = 0;
      const userReactions = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.like) like++;
        if (data.repost) repost++;
        if (data.userId === user?.uid) {
          userReactions.like = data.like;
          userReactions.repost = data.repost;
        }
      });
      setReactions({ counts: { like, repost }, userReactions });
    });
    return () => unsubscribe();
  }, [postId, user?.uid]);

  // コメント取得
  useEffect(() => {
    const commentsRef = collection(db, 'TresurePost', postId, 'comments');
    const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComments(list);
    });
    return () => unsubscribe();
  }, [postId]);

  const handleToggleReaction = async (postId, type) => {
    if (!user) return alert("ログインしてください");
    const ref = doc(db, 'TresurePost', postId, 'reactions', user.uid);
    const current = reactions.userReactions[type];
    await setDoc(ref, {
      userId: user.uid,
      like: type === 'like' ? !current : reactions.userReactions.like || false,
      repost: type === 'repost' ? !current : reactions.userReactions.repost || false,
      type: true
    });
  };

  const handleCommentSubmit = async () => {
    if (!user || !commentText.trim()) return;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};
    await addDoc(collection(db, 'TresurePost', postId, 'comments'), {
      userId: user.uid,
      text: commentText,
      createdAt: new Date(),
      displayName: userData.displayName || '名無し',
      userName: userData.userName || 'anonymous',
      profileImage: userData.profileImage || '/default-avatar.png'
    });
    setCommentText('');
  };

  const handleDelete = async () => {
    if (!window.confirm("この投稿を削除しますか？")) return;
    try {
      await deleteDoc(doc(db, 'TresurePost', postId));
      alert("削除しました");
      navigate(`/treasure/${encodeURIComponent(post.category)}`);
    } catch (err) {
      console.error("削除失敗", err);
      alert("削除に失敗しました");
    }
  };

  const handleEdit = () => {
    navigate('/treasure/write', { state: { post } });
  };

  if (!post) return <div style={{ padding: '2rem' }}>読み込み中...</div>;

  return (
    <>
 <div className={styles.postContainer}>
  <h2>{post.title || '（無題）'}</h2>
  <div style={{
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginBottom: '1rem'
}}>
  <img
    src={post.profileImage || '/default-avatar.png'}
    alt={post.displayName}
    style={{
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      objectFit: 'cover',
      background: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}
  />
  <p style={{ margin: 0, color: '#666', fontWeight: 'bold' }}>
    {post.displayName} さん（@{post.userName}）
  </p>
</div>

{user?.uid === post.userId && (
  <div className={styles.menuWrapper}>
    <button
      onClick={() => setShowMenu(!showMenu)}
      className={styles.menuButton}
      aria-label="メニュー"
    >
      <FaEllipsisV />
    </button>

    {showMenu && (
      <div className={styles.menuPopover}>
        <button onClick={handleEdit}>編集</button>
        <button onClick={handleDelete}>削除</button>
      </div>
    )}
  </div>
)}

  {/* 本文 */}
  <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
    <div
      className="ql-editor"
      style={{
        background: '#f9f9f9',
        padding: '1rem',
        borderRadius: '8px',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: isExpanded ? 'unset' : (post.images?.length ? 2 : 11),
        WebkitBoxOrient: 'vertical'
      }}
      dangerouslySetInnerHTML={{ __html: post.text }}
    />
    {!isExpanded && (
      <button
        onClick={() => setIsExpanded(true)}
        style={{
          background: 'none',
          border: 'none',
          color: '#888',
          cursor: 'pointer',
          marginTop: '0.5rem'
        }}
      >
        ...もっと見る
      </button>
    )}
  </div>

  {/* ここを常に表示に戻す */}
  <ReactionBar
  post={post}
  reactions={reactions}
  onToggleComment={() => setShowComment(true)} // ←ここちゃんと反応させる！
  onToggleReaction={handleToggleReaction}
  onRepost={() => handleToggleReaction(post.id, 'repost')}
  commentCount={comments.length} // ← 追加！
/>


        {showComment && (
  <CommentBottomSheet
    user={user}
    comments={comments}
    onClose={() => setShowComment(false)}
    onSubmit={async (text) => {
      if (!user || !text.trim()) return;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

      await addDoc(collection(db, 'TresurePost', postId, 'comments'), {
        userId: user.uid,
        text: text,
        createdAt: new Date(),
        displayName: userData.displayName || '名無し',
        userName: userData.userName || 'anonymous',
        profileImage: userData.profileImage || '/default-avatar.png'
      });

      setShowComment(false);
    }}
  />
)}
      </div>
    </>
  );
}
