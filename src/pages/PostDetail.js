// 🔽 importを追加
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate,useLocation } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import ReactionBar from '../components/ReactionBar';
import CommentBottomSheet from '../components/CommentBottomSheet';
import { submitComment } from '../utils/submitComment';
import { FaArrowLeft } from 'react-icons/fa';
import './PostDetail.css';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [commentCount, setCommentCount] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [comments, setComments] = useState([]);
  const [showSheet, setShowSheet] = useState(false); // ← コメントシート表示状態

  const location = useLocation();
const params = new URLSearchParams(location.search);
const openComment = params.get('openComment') === 'true';

  useEffect(() => {
    const fetchPost = async () => {
      const postRef = doc(db, 'posts', id);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const data = postSnap.data();
        setPost({ id: postSnap.id, ...data });

        if (data.userId) {
          const userRef = doc(db, 'users', data.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserProfile(userSnap.data());
          }
        }

        // コメント取得
        const commentSnap = await getDocs(collection(db, 'posts', id, 'comments'));
        const commentData = commentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setComments(commentData);
        setCommentCount(commentSnap.size);
      }
    };

    fetchPost();
  }, [id]);

  if (!post || !userProfile) return <div className="loading">読み込み中...</div>;

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return '';
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  return (
    <div className="post-detail-container">
      {/* 上部ヘッダー */}
      <div className="post-header-topbar">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft className="icon" /> ポスト
        </button>
      </div>

      {/* 投稿本体 */}
      <div className="post-header-card">
        <div className="user-info">
          <img src={userProfile.profileImage || '/default-avatar.png'} className="user-avatar" alt="User" />
          <div className="user-text">
            <strong>{userProfile.displayName}</strong>
            <span className="username">@{userProfile.userName}</span>
          </div>
        </div>

        {post.imageUrl && (
          <img src={post.imageUrl} alt="投稿画像" className="post-image" />
        )}

        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="post-meta">
          <span className="timestamp">{formatDate(post.createdAt)}</span>
          <span className="comments-count">コメント: {commentCount}件</span>
        </div>

        <ReactionBar
  post={post}
  onToggleComment={() => setShowSheet(true)} // ← これだけ！
/>
      </div>

      {/* 💬 コメントシートを開くボタン */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button onClick={() => setShowSheet(true)} className="open-comment-button">
          コメントを書く
        </button>
      </div>

      {/* 💬 コメントシート本体 */}
      {showSheet && (
        <CommentBottomSheet
          user={auth.currentUser}
          comments={comments}
          onClose={() => setShowSheet(false)}
          onSubmit={async (text) => {
            await submitComment({ postId: post.id, user: auth.currentUser, text });
            const snap = await getDocs(collection(db, 'posts', post.id, 'comments'));
            const updated = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setComments(updated);  // 更新！
            setCommentCount(updated.length);
          }}
        />
      )}
    </div>
  );
};

export default PostDetail;
