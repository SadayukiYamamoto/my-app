import React, { useState, useEffect } from 'react';
import { addDoc, collection, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaTimes, FaFolderOpen, FaImage } from 'react-icons/fa';
import './PostForm2.css';
import { useLocation } from 'react-router-dom';

const categories = ["iOS Switch", "デザイントーク", "ポートフォリオ", "Google AI", "Gemini"];

export default function PostForm2() {
  const [category, setCategory] = useState("　カテゴリー");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [text, setText] = useState("");
  const [userData, setUserData] = useState({
    displayName: "名無し",
    userName: "anonymous",
    profileImage: "/default-avatar.png"
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);

const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);
  const newImages = files.slice(0, 4 - imagePreviews.length); // 最大4枚
  const urls = newImages.map(file => URL.createObjectURL(file));
  setImagePreviews([...imagePreviews, ...urls]);
};

const removeImage = (index) => {
  setImagePreviews(prev => prev.filter((_, i) => i !== index));
};


  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setUserData(snap.data());
        }
      }
    };
    fetchUserData();

    const handleClickOutside = () => {
      setCategoryOpen(false);
      setShowTitleInput(false);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const location = useLocation();
  const editingPost = location.state?.post;
  
  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || '');
      setCategory(editingPost.category || 'カテゴリー');
      setText(editingPost.text || '');
    }
  }, [editingPost]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert("ログインが必要です");
      return;
    }
    if (!category || !title || !text) {
      alert("すべての項目を入力してください");
      return;
    }
  
    if (editingPost) {
      const ref = doc(db, 'TresurePost', editingPost.id);
      await setDoc(ref, {
        ...editingPost,
        title,
        text,
        category,
        updatedAt: serverTimestamp()
      });
      alert("編集を保存しました！");
      navigate(`/treasure/${encodeURIComponent(category)}/${editingPost.id}`);
    } else {
      const postData = {
        boxName: "TresurePost",
        category,
        title,
        text,
        createdAt: serverTimestamp(),
        displayName: userData.displayName || "名無し",
        userName: userData.userName || "anonymous",
        profileImage: userData.profileImage || "/default-avatar.png",
        userId: user.uid
      };
      try {
        await addDoc(collection(db, "TresurePost"), postData);
        alert("投稿しました！");
        navigate(`/treasure/${encodeURIComponent(category)}`);
      } catch (err) {
        console.error("投稿エラー:", err);
        alert("投稿に失敗しました");
      }
    }
  };
  

  const stopPropagation = (e) => e.stopPropagation();

  return (
    <div className="postform-container">
      <div className="postform-header">
        <button onClick={() => navigate(-1)} className="close-button">×</button>
        <div className="postform-top-controls">
          <button onClick={(e) => { e.stopPropagation(); setCategoryOpen(true); }} className="category-button">
            <FaFolderOpen className="icon-folder" /> {category} <FaChevronDown className="icon-chevron" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setShowTitleInput(true); }} className="title-button">
            {title ? title : "タイトルを入力"}
          </button>
          <button onClick={handleSubmit} className="submit-button">{editingPost ? '保存' : '投稿'}</button>
        </div>
      </div>

      <div className="postform-user">
        <img src={userData.profileImage} alt="icon" className="user-icon" />
        <div className="user-info">
          <span className="user-name">{userData.displayName}</span>
          <span className="user-id">@{userData.userName}</span>
        </div>
      </div>

      {imagePreviews.length > 0 && (
  <div className="image-preview-grid">
    {imagePreviews.map((url, index) => (
      <div className="image-wrapper" key={index}>
        <img src={url} alt={`preview-${index}`} />
        <button className="image-remove-button" onClick={() => removeImage(index)}>×</button>
      </div>
    ))}
  </div>
)}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="どんなノウハウですか？"
        className="postform-textarea"
        rows={20}
      />

      <div className="media-upload">
        <label htmlFor="image-upload"><FaImage size={20} /></label>
        <input
  type="file"
  id="image-upload"
  style={{ display: 'none' }}
  accept="image/*"
  multiple
  onChange={handleImageUpload}
/>

      </div>

      {categoryOpen && (
        <>
          <div className="modal-overlay" onClick={() => setCategoryOpen(false)} />
          <div className="category-modal" onClick={stopPropagation}>
            <div className="category-modal-header">
              <span className="category-title">カテゴリー</span>
              <button className="category-close-button" onClick={() => setCategoryOpen(false)}><FaTimes /></button>
            </div>
            {categories.map(cat => (
              <div className="category-option" key={cat}>
                <input
                  type="radio"
                  name="category"
                  checked={category === cat}
                  onChange={() => setCategory(cat)}
                />
                <span>{cat}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {showTitleInput && (
        <>
          <div className="modal-overlay" onClick={() => setShowTitleInput(false)} />
          <div className="title-modal" onClick={stopPropagation}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タイトルを入力"
              autoFocus
              className="title-input-field"
            />
            <button onClick={() => setShowTitleInput(false)} className="title-close-button">完了</button>
          </div>
        </>
      )}
    </div>
  );
}
