import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import styles from './TreasurePage.module.css'; // ← 追加

export default function TreasurePage() {
  const [counts, setCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "TresurePost"), (snapshot) => {
      const categoryCount = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        const category = data.category || "未分類";
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
      setCounts(categoryCount);
    });
    return () => unsubscribe();
  }, []);

  const categories = ["iOS Switch", "デザイントーク", "ポートフォリオ", "Google AI", "Gemini"];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>ノウハウ宝物庫</h2>
      <div className={styles.cardList}>
      {categories.map((cat) => (
  <div
    key={cat}
    onClick={() => navigate(`/treasure/${encodeURIComponent(cat)}`)}
    className={styles.card}
  >
    <div className={styles.cardLeft}>
    <img
  src={`/icons/${cat.replace(/\s+/g, '-')}.png`}
  alt={cat}
  className={styles.icon}
/>
      <span className={styles.label}>{cat}</span>
    </div>
    <span className={styles.count}>ノウハウ {counts[cat] || 0}</span>
  </div>
))}

      </div>
    </div>
  );
}
