import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function BadgeAssignment({ imageUrl }) {
  const [userId, setUserId] = useState('');
  const [badgeName, setBadgeName] = useState('');

  const handleAssign = async () => {
    if (!userId || !badgeName || !imageUrl) return alert("すべて入力してください");

    const badgeRef = doc(db, 'badges', `${userId}_${badgeName}`);
    await setDoc(badgeRef, {
      userId,
      badgeName,
      imageUrl,
      awardedAt: new Date()
    });
    alert("✅ バッジを付与しました！");
  };

  return (
    <div>
      <h3>🎯 バッジ付与</h3>
      <input placeholder="ユーザーID" value={userId} onChange={e => setUserId(e.target.value)} />
      <input placeholder="バッジ名" value={badgeName} onChange={e => setBadgeName(e.target.value)} />
      <input placeholder="画像URL" value={imageUrl} disabled />
      <button onClick={handleAssign}>付与</button>
    </div>
  );
}
