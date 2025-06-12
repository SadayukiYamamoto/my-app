import React, { useState, useRef, useEffect } from 'react';
import styles from './CommentBottomSheet.module.css';
import { auth } from '../firebase';
import { submitComment } from '../utils/submitComment';

export default function CommentBottomSheet({ user, comments, onClose, onSubmit }) {
  const [text, setText] = useState('');
  const [translateY, setTranslateY] = useState(0);
  const sheetRef = useRef();
  const dragRef = useRef();
  const startY = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
const [dragY, setDragY] = useState(0);


  // タッチで引き上げ／引き下げ
  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };


  const MAX_TRANSLATE_Y = -window.innerHeight * 0.5; // 例: 上に50%までスライド可

  const handleTouchMove = (e) => {
    if (startY.current === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY.current;
    setDragY(deltaY);
  };
  
  const handleTouchEnd = () => {
    if (dragY > 80) {
      onClose(); // 下に引っ張ったら閉じる
    } else if (dragY < -50) {
      setIsExpanded(true); // 上に引いたら最大化
    } else {
      setIsExpanded(false); // 初期状態に戻す
    }
    setDragY(0);
    startY.current = null;
  };
  

  return (
    <>
      {/* ✅ backdrop をクリックした時だけ閉じるようにする */}
      <div
  className={styles.backdrop}
  onClick={(e) => {
    e.stopPropagation(); // ← 上位の onClick（カード遷移など）を止める
    onClose();           // ← 通常通り閉じる
  }}
/>
  
      <div
  ref={sheetRef}
  className={`${styles.sheet} ${isExpanded ? styles.expanded : ''}`}
  onClick={(e) => e.stopPropagation()} // ✅ これ追加
  style={{
    transform: dragY !== 0 ? `translateY(${dragY}px)` : 'translateY(0)',
    transition: dragY === 0 ? 'transform 0.25s ease' : 'none',
  }}
>
        <div
          className={styles.dragHandleWrapper}
          ref={dragRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.dragHandle} />
        </div>
  
        <div className={styles.content}>
          <h4 className={styles.commentHeader}>コメント</h4>
          <ul className={styles.commentList}>
            {comments.map((c) => (
              <li key={c.id} className={styles.commentItem}>
                <img
                  src={c.profileImage || '/default-avatar.png'}
                  className={styles.avatar}
                  alt="avatar"
                />
                <div className={styles.bubble}>
                  <div className={styles.name}>{c.displayName}</div>
                  <div className={styles.text}>{c.text}</div>
                  <div className={styles.timestamp}>
                    {c.createdAt?.toDate
                      ? c.createdAt.toDate().toLocaleString('ja-JP')
                      : '時間不明'}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
  
        <div className={styles.inputArea}>
          <img
            src={user?.profileImage || '/default-avatar.png'}
            className={styles.avatar}
            alt="me"
          />
          <input
            className={styles.inputField}
            placeholder="コメントしてみよう"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {text && (
            <button
              className={styles.sendButton}
              onClick={async () => {
                await onSubmit(text);
                setText('');
              }}
            >
              ✈
            </button>
          )}
        </div>
      </div>
    </>
  );
}
