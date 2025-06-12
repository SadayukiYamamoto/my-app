// 📁 PixTubeHome.js（完全修正版）
import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "./PixTube.css";
import { useNavigate } from "react-router-dom";

const categories = [
  { key: "all", label: "すべて" },
  { key: "iOS Switch", label: "iOS Switch" },
  { key: "Gemini", label: "Gemini" },
  { key: "デザイントーク", label: "デザイントーク" },
  { key: "優良事例", label: "優良事例" },
  { key: "ポートフォリオ", label: "ポートフォリオ" },
];

const PixTubeHome = () => {
  const [videos, setVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      const snap = await getDocs(collection(db, "pixtubePosts"));
      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString().split("T")[0] || "不明"
      }));
      setVideos(list);
    };
    fetchVideos();
  }, []);

  const shorts = videos.filter(v => v.isShort).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const filteredVideos = videos
    .filter(v => !v.isShort && (selectedCategory === "all" || v.category === selectedCategory))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  // 🔢 ダミーショート生成（最大8まで）
  const dummyCount = Math.max(0, 8 - shorts.length);

  return (
    <div className="pixtube-home">
      <div className="shorts-section">
        <h3 className="shorts-title">ショート</h3>
        <div className="shorts-scroll">
          {/* 🎥 実ショート動画 */}
          {shorts.map((short) => (
            <div
              key={short.id}
              className="shorts-card"
              onClick={() => navigate(`/pixtube/${short.id}`)}
            >
              <img src={short.thumbnail} alt="short" className="shorts-thumbnail" />
              <div className="shorts-title-text">{short.title}</div>
            </div>
          ))}

          {/* 📦 仮カード（クリックなし） */}
          {Array.from({ length: dummyCount }, (_, i) => (
            <div key={`dummy-${i}`} className="shorts-card coming-soon">
              <div className="shorts-thumbnail dummy" />
              <div className="shorts-title-text">Coming soon...</div>
            </div>
          ))}
        </div>
      </div>

      <div className="category-bar">
        {categories.map((cat) => (
          <button
            key={cat.key}
            className={`category-button ${selectedCategory === cat.key ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 📺 通常動画表示 */}
      {filteredVideos.map((video) => (
        <div
          className="home-video-card"
          key={video.id}
          onClick={() => navigate(`/pixtube/${video.id}`)}
        >
          <div className="thumbnail-wrapper">
            <img src={video.thumbnail} alt="thumbnail" className="thumbnail" />
            <span className="duration">{video.duration}</span>
          </div>
          <div className="video-info">
            <div className="video-title">{video.title}</div>
            <div className="video-meta">
              <span>{video.author}</span>・<span>{video.updatedAt}</span>
            </div>
          </div>
        </div>
      ))}

      {/* 🔒 通常動画のダミー補完（クリック不可） */}
      {filteredVideos.length < 3 &&
        Array.from({ length: 3 - filteredVideos.length }, (_, i) => (
          <div className="home-video-card dummy" key={`dummy-video-${i}`}>
            <div className="thumbnail-wrapper">
              <div className="thumbnail dummy-thumbnail" />
              <span className="duration">--:--</span>
            </div>
            <div className="video-info">
              <div className="video-title">Coming soon...</div>
              <div className="video-meta">準備中・--</div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default PixTubeHome;
