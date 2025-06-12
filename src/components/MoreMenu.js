// src/components/MoreMenu.js
import React, { useState } from 'react';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, deleteObject } from 'firebase/storage';
import './MoreMenu.css';

const MoreMenu = ({ post, currentUserId, onEdit, onDelete, scrollDirection }) => {
  const [open, setOpen] = useState(false);

  const toggleMenu = (e) => {
    e.stopPropagation(); // ✅ 親(post-card)へのクリック伝播を防ぐ
    setOpen(!open);
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation(); // ✅ ドロップダウン内のボタンでも同様に止める
    action();
    setOpen(false);
  };

  return (
    <div className={`more-menu-wrapper ${scrollDirection === "down" ? "moremenu-hidden" : ""}`}>
      <button onClick={toggleMenu} className="more-menu-button">⋮</button>
      {open && (
        <div className="more-menu-dropdown" onClick={(e) => e.stopPropagation()}>
          {post.userId === currentUserId && (
            <>
              <button onClick={(e) => handleActionClick(e, () => onEdit(post))}>編集</button>
              <button onClick={(e) => handleActionClick(e, () => onDelete(post.id))}>削除</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MoreMenu;

