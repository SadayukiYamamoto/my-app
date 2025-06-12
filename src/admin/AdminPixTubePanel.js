import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import "./AdminPixTubePanel.css"; // CSSファイルは別途定義

const CATEGORY_OPTIONS = [
  { key: "iOS Switch", label: "iOS Switch" },
  { key: "Gemini", label: "Gemini" },
  { key: "デザイントーク", label: "デザイントーク" },
  { key: "優良事例", label: "優良事例" },
  { key: "ポートフォリオ", label: "ポートフォリオ" }
];

const AdminPixTubePanel = () => {
  const [videos, setVideos] = useState([]);
  const [newVideo, setNewVideo] = useState({
    title: "",
    category: "",
    author: "",
    file: null,
    thumbnail: null,
    isShort: false // ← 追加
  });
  const [videoDuration, setVideoDuration] = useState("0:00");
  const videoRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // フォーム変更
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setNewVideo((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));

    if (name === "file" && files[0]) {
      const videoElement = videoRef.current;
      const objectURL = URL.createObjectURL(files[0]);
      videoElement.src = objectURL;
    }
  };

  // 動画メタ情報取得
  const handleLoadedMetadata = () => {
    const videoElement = videoRef.current;
    const duration = videoElement.duration;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60).toString().padStart(2, "0");
  
    setVideoDuration(`${minutes}:${seconds}`);
  
    // ここで自動 isShort 判定
    setNewVideo(prev => ({
      ...prev,
      isShort: duration <= 60 // ← 60秒以下なら true に
    }));
  };

  // 送信処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { file, thumbnail, title, category, author } = newVideo;
  
    if (!file) return alert("動画ファイルを選択してください");
  
    setIsUploading(true); // ← ここで「アップロード中」開始
  
    try {
      // ①動画アップロード
      const videoRefInStorage = ref(storage, `pixtubeVideos/${file.name}`);
      await uploadBytes(videoRefInStorage, file);
      const videoURL = await getDownloadURL(videoRefInStorage);
  
      // ②サムネイルアップロード
      let thumbnailURL = "";
      if (thumbnail) {
        const thumbRefInStorage = ref(storage, `pixtubeThumbnails/${thumbnail.name}`);
        await uploadBytes(thumbRefInStorage, thumbnail);
        thumbnailURL = await getDownloadURL(thumbRefInStorage);
      }
  
      // ③Firestore 保存
      await addDoc(collection(db, "pixtubePosts"), {
        title,
        category,
        author,
        src: videoURL,
        thumbnail: thumbnailURL,
        updatedAt: Timestamp.now(),
        likes: 0,
        comments: 0,
        duration: videoDuration,
        isShort: newVideo.isShort
      });
  
      alert("投稿が完了しました 🎉");
  
      setNewVideo({ title: "", category: "", author: "", file: null, thumbnail: null, isShort: false });
      setVideoDuration("0:00");
      fetchVideos();
    } catch (error) {
      console.error("投稿に失敗しました:", error);
      alert("投稿に失敗しました");
    } finally {
      setIsUploading(false); // ← 終了後は戻す
    }
  };

  const fetchVideos = async () => {
    const querySnapshot = await getDocs(collection(db, "pixtubePosts"));
    const fetchedVideos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setVideos(fetchedVideos);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div className="admin-panel">
      <h2>PixTube 投稿管理パネル</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <input name="title" type="text" placeholder="タイトル" value={newVideo.title} onChange={handleChange} required />
        <select name="category" value={newVideo.category} onChange={handleChange} required>
          <option value="">カテゴリを選択</option>
          {CATEGORY_OPTIONS.map(opt => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
        <input name="author" type="text" placeholder="投稿者名" value={newVideo.author} onChange={handleChange} required />
        <input name="file" type="file" accept="video/*" onChange={handleChange} required />
        <input name="thumbnail" type="file" accept="image/*" onChange={handleChange} />
        <label>
  <input
    type="checkbox"
    name="isShort"
    checked={newVideo.isShort}
    onChange={(e) =>
      setNewVideo((prev) => ({
        ...prev,
        isShort: e.target.checked
      }))
    }
  />
  ショート動画として投稿（60秒以下なら自動でON）
</label>
        <video ref={videoRef} onLoadedMetadata={handleLoadedMetadata} hidden />
        <button type="submit" disabled={isUploading}>
        {isUploading && <div className="spinner">アップロード中です...</div>}
</button>
      </form>

      <table className="video-table">
        <thead>
          <tr>
            <th>サムネイル</th>
            <th>タイトル</th>
            <th>カテゴリ</th>
            <th>投稿者</th>
            <th>投稿日</th>
            <th>再生</th>
          </tr>
        </thead>
        <tbody>
          {videos.map((video) => (
            <tr key={video.id}>
              <td><img src={video.thumbnail} alt="thumb" width="100" /></td>
              <td>{video.title}</td>
              <td>{video.category}</td>
              <td>{video.author}</td>
              <td>{new Date(video.updatedAt?.seconds * 1000).toLocaleString()}</td>
              <td><video src={video.src} width="160" controls /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPixTubePanel;
