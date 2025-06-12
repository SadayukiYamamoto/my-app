import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export default function AdminPointManager() {
  const [users, setUsers] = useState([]);
  const [pointsMap, setPointsMap] = useState({});

  // ユーザー一覧取得
  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, 'users'));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(list);
    };
    fetchUsers();
  }, []);

  // 入力変化処理
  const handleInputChange = (userId, value) => {
    setPointsMap(prev => ({ ...prev, [userId]: value }));
  };

  // ポイント更新処理
  const handleUpdatePoint = async (userId) => {
    const point = parseInt(pointsMap[userId], 10);
    if (isNaN(point)) {
      alert("数値を入力してください");
      return;
    }
    try {
      await updateDoc(doc(db, 'users', userId), { point });
      alert("ポイントを更新しました！");
    } catch (err) {
      console.error("更新エラー:", err);
      alert("更新に失敗しました");
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🎯 ユーザーポイント管理</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {users.map(user => (
          <li key={user.id} style={{ marginBottom: '1rem', borderBottom: '1px solid #ddd', paddingBottom: '1rem' }}>
            <div><strong>{user.displayName}</strong>（@{user.userName}）</div>
            <div>現在: {user.point ?? 0} pt</div>
            <input
              type="number"
              placeholder="新しいポイント"
              value={pointsMap[user.id] || ''}
              onChange={(e) => handleInputChange(user.id, e.target.value)}
              style={{ marginRight: '1rem', padding: '0.25rem' }}
            />
            <button onClick={() => handleUpdatePoint(user.id)}>反映する</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
