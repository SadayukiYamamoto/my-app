import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { FaHeart, FaRetweet, FaRegCommentDots } from 'react-icons/fa';
import styles from './TreasureCategoryList.module.css';

export default function TreasureCategoryList() {
  const { category } = useParams();
  const [posts, setPosts] = useState([]);
  const [reactionCounts, setReactionCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "TresurePost"), where("category", "==", category));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const posts = [];
      const counts = {};

      for (const docSnap of snapshot.docs) {
        const post = { id: docSnap.id, ...docSnap.data() };
        posts.push(post);

        // reactions 集計
        const reactionsSnap = await getDocs(collection(db, "TresurePost", docSnap.id, "reactions"));
        let like = 0, repost = 0;
        reactionsSnap.forEach((r) => {
          const data = r.data();
          if (data.like) like++;
          if (data.repost) repost++;
        });

        // comments 集計
        const commentsSnap = await getDocs(collection(db, "TresurePost", docSnap.id, "comments"));
        counts[docSnap.id] = {
          like,
          repost,
          comment: commentsSnap.size
        };
      }

      setPosts(posts);
      setReactionCounts(counts);
    });

    return () => unsubscribe();
  }, [category]);

  return (
    <div className={styles.container}> {/* ← ここ重要！ */}
  
      <h2 className={styles.title}>{category} の投稿一覧</h2>
  
      {posts.length === 0 ? (
        <p>まだ投稿がありません。</p>
      ) : (
        <ul className={styles.ulReset}> {/* ← ul の余白も除去 */}
{posts.map((post) => (
  <li
    key={post.id}
    className={styles.postCard}
    onClick={() => navigate(`/treasure/${encodeURIComponent(category)}/${post.id}`)}
  >
    <div className={styles.cardLeft}>
      <img
        src={post.profileImage || "/default-profile.png"}
        alt={post.displayName}
        className={styles.profileIcon}
        onClick={(e) => {
          e.stopPropagation(); // 投稿詳細ページ遷移を止める
          navigate(`/profile/${post.userId}`); // プロフィールページへ
        }}
        style={{ cursor: "pointer" }}
      />
      <div className={styles.textInfo}>
        <span className={styles.titleText}>{post.title || "（無題）"}</span>
        <span className={styles.subText}>
          {post.displayName || "名無し"} さんの投稿
        </span>
      </div>
    </div>

    <div className={styles.countBadge}>
      <div><FaRegCommentDots /> {reactionCounts[post.id]?.comment || 0}</div>
      <div><FaHeart /> {reactionCounts[post.id]?.like || 0}</div>
      <div><FaRetweet /> {reactionCounts[post.id]?.repost || 0}</div>
    </div>
  </li>
))}
        </ul>
      )}
    </div>
  );
  
}
