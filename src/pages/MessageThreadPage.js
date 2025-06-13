// src/pages/MessageThreadPage.js
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  doc,
  setDoc,
  collection,
  query,
  orderBy,
  addDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

const MessageThreadPage = () => {
  const { threadId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const user = auth.currentUser;

  useEffect(() => {
    const q = query(
      collection(db, "messages", threadId, "chats"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [threadId]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    await addDoc(collection(db, "messages", threadId, "chats"), {
      senderId: user.uid,
      text: input.trim(),
      createdAt: serverTimestamp(),
    });

    // スレッド情報も更新（最新メッセージや時刻）
    await updateDoc(doc(db, "messages", threadId), {
      lastMessage: input.trim(),
      updatedAt: serverTimestamp(),
    });

    // 変更後（OK）
    await setDoc(doc(db, "messages", threadId), {
      lastMessage: input.trim(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    setInput("");
  };

  return (
    <div style={{ padding: "1rem", height: "90vh", display: "flex", flexDirection: "column" }}>
      <h3>チャット</h3>
      <div style={{ flex: 1, overflowY: "auto", marginBottom: "1rem" }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              textAlign: msg.senderId === user.uid ? "right" : "left",
              marginBottom: "0.5rem"
            }}
          >
            <span style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              background: msg.senderId === user.uid ? "#dcf8c6" : "#eee",
              borderRadius: "1rem"
            }}>{msg.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          style={{ flex: 1, padding: "0.5rem", borderRadius: "8px" }}
        />
        <button onClick={sendMessage} style={{ padding: "0.5rem 1rem" }}>送信</button>
      </div>
    </div>
  );
};

export default MessageThreadPage;
