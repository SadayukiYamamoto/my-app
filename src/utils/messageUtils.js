import {
    doc,
    setDoc,
    addDoc,
    collection,
    getDocs,
    query,
    where,
    serverTimestamp
  } from "firebase/firestore";
  import { db } from "../firebase";
  
  /**
   * 2人のユーザーのDMスレッドIDを決定（常に同じ並びで生成）
   */
  const generateThreadId = (uid1, uid2) => {
    return [uid1, uid2].sort().join("_");
  };
  
  /**
   * スレッドがなければ作成して、メッセージを送信
   */
  export const sendDirectMessage = async ({ fromUserId, toUserId, text }) => {
    const threadId = generateThreadId(fromUserId, toUserId);
    const threadRef = doc(db, "messages", threadId);
  
    // 🔽 スレッド情報を更新・作成
    await setDoc(threadRef, {
      participants: [fromUserId, toUserId],
      lastMessage: text,
      updatedAt: serverTimestamp()
    }, { merge: true });
  
    // 🔽 メッセージを追加
    const chatRef = collection(db, "messages", threadId, "chats");
    await addDoc(chatRef, {
      senderId: fromUserId,
      text,
      createdAt: serverTimestamp()
    });
  
    return threadId;
  };
  