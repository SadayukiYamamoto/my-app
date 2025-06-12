import React, { useState, useRef, useEffect } from 'react';
import { db, collection, addDoc, doc, getDoc,updateDoc,deleteField } from '../firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage, auth } from '../firebase';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaImage } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './PostForm.css';
import { useNavigate } from "react-router-dom";
import { useSearchParams } from 'react-router-dom';



const modules = {
  toolbar: {
    container: [['image']],
    handlers: {
      image: () => document.getElementById('fileUpload').click(),
    }
  }
};

const formats = ['image'];

const PostForm = () => {
  const [content, setContent] = useState('');
  const [scheduleDate, setScheduleDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [userData, setUserData] = useState({ displayName: '', profileImage: '' });
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const quillRef = useRef(null);
  const [searchParams] = useSearchParams();
const editId = searchParams.get("edit");
const [title, setTitle] = useState('');
const [selectedCategory, setSelectedCategory] = useState('');
const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setUserData(snap.data());
        }
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchPostToEdit = async () => {
      if (!editId) return;
      const docRef = doc(db, "posts", editId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setTitle(data.title || "");
        setContent(data.content || "");
        setSelectedCategory(data.category || "");
        setImageUrl(data.imageUrl || "");
        // 他にも必要なstateに値をセット
      }
    };
    fetchPostToEdit();
  }, [editId]);

  const sanitizeContent = (html) => {
    return html
      .replace(/<p>/g, '<span style="display:block;">')
      .replace(/<img[^>]*>/g, match => match.includes('data:') ? '' : match)
      .replace(/<blockquote>[\s\S]*?<\/blockquote>/g, '')
      .replace(/<pre>[\s\S]*?<\/pre>/g, '')
      .replace(/<div[^>]*>(.*?)<\/div>/g, '$1')
      .replace(/<\/p>/g, '</span>');
  };

  const insertFileToEditor = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const user = auth.currentUser;
    if (!user) {
      alert('ファイルアップロードにはログインが必要です');
      return;
    }

    const fileType = file.type;
    const isVideo = fileType.startsWith('video/');

    try {
      const uuid = crypto.randomUUID();
      const encodedFileName = encodeURIComponent(file.name);
      const path = `users/${user.uid}/posts/${uuid}-${encodedFileName}`;
      const storageRef = ref(storage, path);
      await uploadBytesResumable(storageRef, file);
      const url = await getDownloadURL(storageRef);

      if (isVideo) {
        setVideoPreview(url);
      } else {
        setImagePreview(url);
      }
    } catch (error) {
      console.error('ファイルアップロードに失敗しました:', error);
      alert('アップロードに失敗しました。Firebase Storage のルールをご確認ください。');
    }
  };

  const handleRemoveImage = () => setImagePreview(null);
  const handleRemoveVideo = () => setVideoPreview(null);

  const handleSubmit = async (isScheduled = false) => {
    if (!content.trim()) {
      alert("投稿内容を入力してください！");
      return;
    }
  
    const user = auth.currentUser;
    if (!user) {
      alert("ログインが必要です");
      return;
    }
  
    setLoading(true);
    try {
      const postData = {
        title,
        content: sanitizeContent(content),
        category: selectedCategory,
        imageUrl,
        userId: user.uid,
        updatedAt: new Date(),
        scheduledAt: isScheduled ? scheduleDate : null,
        isScheduled: isScheduled
      };
  
      if (editId) {
        // 🔁 編集モード → 上書き更新
        await updateDoc(doc(db, "posts", editId), postData);
        alert("投稿を更新しました！");
      } else {
        // 🆕 新規投稿
        postData.createdAt = new Date();
        await addDoc(collection(db, isScheduled ? 'scheduledPosts' : 'posts'), postData);
        alert(isScheduled ? "投稿が予約されました！" : "投稿が成功しました！");
      }
  
      setTitle('');
      setContent('');
      setSelectedCategory('');
      setImageUrl('');
      setScheduleDate(null);
      setShowPopup(isScheduled);
      setTimeout(() => setShowPopup(false), 3000);
  
      navigate('/pitter');
    } catch (error) {
      alert("投稿に失敗しました。");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  

  const navigate = useNavigate();


  return (
    <div className="post-form-container">
            <div className="post-header-bar">
  <button className="close-button" onClick={() => navigate('/pitter')}>×</button>
  <button
    className="submit-button-top"
    onClick={() => handleSubmit(false)}
    disabled={loading}
  >
    {loading ? "投稿中…" : "投稿する"}
  </button>
</div>


      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        {userData.profileImage && (
          <img
            src={userData.profileImage}
            alt="プロフィール画像"
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginRight: '12px' }}
          />
        )}
        <strong style={{ fontSize: '16px' }}>{userData.displayName || 'ユーザー名'}</strong>
      </div>


      <ReactQuill
        ref={quillRef}
        value={content}
        onChange={setContent}
        modules={modules}
        formats={formats}
        placeholder="いまどうしてる？"
      />

      <input
        type="file"
        id="fileUpload"
        accept="image/*,video/*"
        onChange={insertFileToEditor}
        style={{ display: 'none' }}
      />

      {imagePreview && (
        <div className="preview-wrapper">
          <img src={imagePreview} alt="プレビュー画像" className="preview-image" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          <button className="remove-preview" onClick={handleRemoveImage}>×</button>
        </div>
      )}
      {videoPreview && (
        <div className="preview-wrapper">
          <video src={videoPreview} controls className="preview-video" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          <button className="remove-preview" onClick={handleRemoveVideo}>×</button>
        </div>
      )}

      <div className="icon-upload">
        <label htmlFor="fileUpload" title="画像または動画を挿入">
          <FaImage size={20} style={{ cursor: 'pointer', marginTop: '10px' }} />
        </label>
      </div>

      <div className="schedule">
        <label>投稿予約日時：</label>
        <DatePicker
          selected={scheduleDate}
          onChange={(date) => setScheduleDate(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="yyyy/MM/dd HH:mm"
          placeholderText="日時を選択"
        />
      </div>

      <div className="post-actions">
        <button className="submit-button" onClick={() => handleSubmit(false)} disabled={loading}>
          {loading ? '投稿中...' : '投稿する'}
        </button>
        <button className="reserve-button" onClick={() => handleSubmit(true)}>
          投稿を予約する
        </button>
      </div>

      {showPopup && (
        <div className="popup">
          📅 投稿が予約されました！（{scheduleDate?.toLocaleString()}）
        </div>
      )}
    </div>
  );
};

export default PostForm;
