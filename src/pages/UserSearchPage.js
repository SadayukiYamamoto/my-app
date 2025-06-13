import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { sendDirectMessage } from "../utils/sendDirectMessage"; // あなたの関数

import { useNavigate } from "react-router-dom";

const UserSearchPage = () => {
  const [users, setUsers] = useState([]);
  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const userList = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => u.id !== currentUser.uid); // 自分を除外
      setUsers(userList);
    };
    fetchUsers();
  }, []);

  const startChat = async (toUserId) => {
    const threadId = await sendDirectMessage({
      fromUserId: currentUser.uid,
      toUserId,
      text: "こんにちは！" // 初期メッセージ（任意）
    });
    navigate(`/messages/${threadId}`);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>ユーザー検索</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id} style={{ marginBottom: "1rem" }}>
            <div>{u.displayName}</div>
            <button onClick={() => startChat(u.id)}>この人とチャット開始</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSearchPage;
