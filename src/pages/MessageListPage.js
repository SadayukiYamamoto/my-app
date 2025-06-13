// src/pages/MessageListPage.js
import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';

const MessageListPage = () => {
  const [threads, setThreads] = useState([]);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const threadData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const otherUserId = data.participants.find(id => id !== user.uid);

          // 相手のプロフィール情報を取得
          const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
          const otherUser = otherUserDoc.exists() ? otherUserDoc.data() : {};

          return {
            id: docSnap.id,
            lastMessage: data.lastMessage || "",
            updatedAt: data.updatedAt?.toDate().toLocaleString() || "",
            otherUserId,
            otherUserName: otherUser.displayName || "Unknown",
            otherUserIcon: otherUser.photoURL || "/default-icon.png"
          };
        })
      );

      setThreads(threadData);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>チャット一覧</h2>
      {threads.length === 0 ? (
        <p>チャットスレッドがありません</p>
      ) : (
        <ul>
          {threads.map((thread) => (
            <li
              key={thread.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                borderBottom: '1px solid #ccc',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/messages/${thread.id}`)}
            >
              <img
                src={thread.otherUserIcon}
                alt="user icon"
                style={{ width: 40, height: 40, borderRadius: "50%", marginRight: "1rem" }}
              />
              <div>
                <div><strong>{thread.otherUserName}</strong></div>
                <div style={{ fontSize: "0.9rem", color: "#555" }}>{thread.lastMessage}</div>
                <div style={{ fontSize: "0.8rem", color: "#999" }}>{thread.updatedAt}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MessageListPage;
