import React, { useState, useEffect } from 'react';
import './Home.css';
import { addDoc, collection, doc, getDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db, auth, storage } from '../firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { FaImage, FaVideo, FaRegCommentDots, FaRetweet, FaHeart, FaEllipsisH } from 'react-icons/fa';

const Home = ({ user, profile }) => {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const querySnapshot = await getDocs(collection(db, 'posts'));
      const filtered = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.category === '気軽に一言' && p.boxName === 'Pixtter')
        .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      setPosts(filtered);
    };
    fetchPosts();
  }, []);

  const getProfileImageUrl = () => {
    if (profile?.profileImage) {
      const separator = profile.profileImage.includes('?') ? '&' : '?';
      return `${profile.profileImage}${separator}timestamp=${new Date().getTime()}`;
    }
    return "https://picsum.photos/100";
  };

  const profileImage = getProfileImageUrl();

  const getUserProfile = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    return {
      displayName: userSnap?.data()?.displayName || user.displayName || "匿名",
      userName: userSnap?.data()?.userName || "unknown",
      profileImage: userSnap?.data()?.profileImage || ""
    };
  };

  const handlePost = async () => {
    if (!content.trim()) return alert("投稿内容を入力してください！");
    const currentUser = auth.currentUser;
    if (!currentUser) return alert("ログインが必要です");
    try {
      const { displayName, userName, profileImage } = await getUserProfile(currentUser);
      let imageUrl = "";
      let videoUrl = "";
      if (imageFile) {
        const imageRef = ref(storage, `posts/images/${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }
      if (videoFile) {
        const videoRef = ref(storage, `posts/videos/${videoFile.name}`);
        await uploadBytes(videoRef, videoFile);
        videoUrl = await getDownloadURL(videoRef);
      }
      const postData = {
        content,
        category: "気軽に一言",
        boxName: "Pixtter",
        userId: currentUser.uid,
        displayName,
        userName,
        profileImage,
        imageUrl,
        videoUrl,
        createdAt: new Date(),
        reactions: 0,
        comments: 0,
        views: 0,
        isScheduled: false
      };
      await addDoc(collection(db, 'posts'), postData);
      alert("投稿が成功しました！");
      setContent('');
      setImageFile(null);
      setVideoFile(null);
      setImagePreview(null);
      setVideoPreview(null);
      setPosts(prev => [postData, ...prev]);
    } catch (error) {
      console.error("投稿に失敗しました:", error);
      alert("投稿に失敗しました。");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp?.seconds) return '';
    const now = new Date();
    const then = new Date(timestamp.seconds * 1000);
    const diff = (now - then) / 1000;
    if (diff < 60 * 60) return `${Math.floor(diff / 60)}分前`;
    if (diff < 60 * 60 * 24) return `${Math.floor(diff / 3600)}時間前`;
    if (diff < 60 * 60 * 24 * 7) return `${Math.floor(diff / 86400)}日前`;
    return then.toLocaleDateString();
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("この投稿を削除しますか？");
    if (!confirmDelete) return;
    try {
      await deleteDoc(doc(db, "posts", id));
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("削除失敗:", error);
    }
  };

  return (
    <div className="home-container">
      <div className="main-visual">
        <img src="/assets/pixeline-header.png" alt="PixelLine メインビジュアル" />
      </div>

      <section className="growth-section">
        <h2>自己育成に活用しよう！</h2>
        <div className="card-container">
          <a href="http://localhost:3000/treasure" className="card-link">
            <div className="card">
              <img src="/assets/card1.png" alt="ノウハウ宝物庫" />
              <div className="card-text">
                <h3>ノウハウ宝物庫</h3>
                <p>各店から集まったノウハウを自分流に取り入れよう！</p>
              </div>
            </div>
          </a>
          <a href="https://drive.google.com/drive/folders/1xALFDkXdk8S8RF_fnrZIcKqlpEOhhhj_?usp=sharing" className="card-link" target="_blank" rel="noopener noreferrer">
            <div className="card">
              <img src="/assets/card2.png" alt="社内活動振り返り" />
              <div className="card-text">
                <h3>社内活動振り返り</h3>
                <p>過去の社内活動資料はこちらから！</p>
              </div>
            </div>
          </a>
          <a href="https://drive.google.com/drive/folders/1UZLCOUok0lKeMwyOw0SXKO4yTKpcvKcZ" className="card-link" target="_blank" rel="noopener noreferrer">
            <div className="card">
              <img src="/assets/card3.png" alt="事務局だよりバックナンバー" />
              <div className="card-text">
                <h3>事務局だよりバックナンバー</h3>
                <p>最新版以外はこちらから！</p>
              </div>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;