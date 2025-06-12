// src/components/CommentSection.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  doc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';

const CommentSection = ({ postId, postUserId, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null); // 親コメントID
  const user = auth.currentUser;

  useEffect(() => {
    const fetchComments = async () => {
      const snapshot = await getDocs(collection(db, 'posts', postId, 'comments'));
      const data = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });

      // ソート（createdAt昇順）＋ネスト構成
      const topLevel = data.filter(c => !c.parentId);
      const nested = topLevel.map(c => ({
        ...c,
        replies: data.filter(r => r.parentId === c.id)
      }));
      setComments(nested);
    };

    fetchComments();
  }, [postId]);

  const handleSubmit = async () => {
    if (!text.trim() || !user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const profile = userSnap.exists() ? userSnap.data() : {};

    await addDoc(collection(db, 'posts', postId, 'comments'), {
      text,
      createdAt: serverTimestamp(),
      userId: user.uid,
      displayName: profile.displayName || user.displayName || '匿名',
      userName: profile.userName || 'unknown',
      profileImage: profile.profileImage || '/default-avatar.png',
      parentId: replyTo || null
    });

    setText('');
    setReplyTo(null);
    if (onCommentAdded) onCommentAdded(); // ✅ 追加されたコメントの反映を通知
  };

  const handleDelete = async (commentId) => {
    await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  return (
    <div className="comment-section">
      <h4>💬 コメント {comments.length}</h4>
      {comments.map(c => (
        <div key={c.id} className="comment">
          <img src={c.profileImage} alt="avatar" className="comment-avatar" />
          <div className="comment-body">
            <div className="comment-header">
              <strong>{c.displayName}</strong>
              <span className="username">@{c.userName}</span>
            </div>
            <p>{c.text}</p>
            <div className="comment-actions">
              {user?.uid === c.userId || user?.uid === postUserId ? (
                <button onClick={() => handleDelete(c.id)}>削除</button>
              ) : null}
              <button onClick={() => setReplyTo(c.id)}>返信</button>
            </div>

            {c.replies?.map(r => (
              <div key={r.id} className="reply">
                <img src={r.profileImage} alt="avatar" className="comment-avatar" />
                <div className="comment-body">
                  <div className="comment-header">
                    <strong>{r.displayName}</strong>
                    <span className="username">@{r.userName}</span>
                  </div>
                  <p>{r.text}</p>
                  <div className="comment-actions">
                    {user?.uid === r.userId || user?.uid === postUserId ? (
                      <button onClick={() => handleDelete(r.id)}>削除</button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="comment-form">
        <input
          type="text"
          placeholder={replyTo ? "返信内容を入力…" : "コメントを入力"}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={handleSubmit}>投稿</button>
      </div>
    </div>
  );
};

export default CommentSection;
