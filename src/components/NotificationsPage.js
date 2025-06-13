//NotificationsPage
import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'notices'),
      where('toUserId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notifList);
      },
      (error) => {
        console.error('通知の取得エラー:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const sendTestNotification = async () => {
    if (!currentUser) {
      alert('ログインが必要です');
      return;
    }

    try {
      await addDoc(collection(db, 'notices'), {
        type: 'like',
        postId: 'TEST_ID',
        postContent: 'これはテスト投稿です。',
        fromUserId: currentUser.uid,
        fromUserName: currentUser.displayName || 'NoName',
        fromUserIcon: currentUser.photoURL || '',
        toUserId: currentUser.uid,
        timestamp: serverTimestamp(),
        isRead: false,
        app: 'treasure' // ← ここ追加で切り替え確認も可能
      });
      alert('✅ テスト通知を送信しました！');
    } catch (err) {
      console.error('通知送信エラー:', err);
      alert('通知の送信に失敗しました');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await updateDoc(doc(db, 'notices', notif.id), { isRead: true });
      } catch (err) {
        console.error('通知の既読更新エラー:', err);
      }
    }
  
    if (notif.app === 'treasure') {
      navigate(`/treasure/未分類/${notif.postId}`); // ※未分類の部分は必要に応じてnotif.categoryにするのが理想
    } else {
      navigate(`/post/${notif.postId}`);
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1 className="notifications-title">通知</h1>
        <button onClick={sendTestNotification} className="send-test-button">
          テスト通知を送る
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="no-notifications">通知はありません。</p>
      ) : (
        <ul className="notifications-list">
          {notifications.map((notif) => (
            <li
              key={notif.id}
              className="notification-container"
              onClick={() => handleNotificationClick(notif)}
            >
              <img
                src={notif.fromUserIcon || '/default-icon.png'}
                className="notification-icon"
                alt="icon"
              />
              <div className="notification-body">
                <div className="notification-header">
                  {notif.type === 'like' && <span className="reaction-icon">❤️</span>}
                  {notif.type === 'repost' && <span className="reaction-icon">🔁</span>}
                  <p className="text">
                    <span className="font-semibold">{notif.fromUserName}</span> さんがあなたの投稿を
                    {notif.type === 'like' && 'いいねしました'}
                    {notif.type === 'repost' && 'リポストしました'}
                  </p>
                </div>
                <p className="text">
                  {notif.postContent || '（投稿内容なし）'}
                </p>
                <span className="meta">
                  {notif.timestamp?.toDate().toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage;