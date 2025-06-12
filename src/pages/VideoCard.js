// VideoCard.js（読み込み中のスピナー付き）
import React, { useEffect, useRef, useState } from "react";
import { doc, getDoc, collection, getDocs, addDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import {
  FaHeart,
  FaRegCommentDots,
  FaRetweet,
  FaPlay,
  FaPause
} from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const VideoCard = ({ video, profile, onPlaySuccess }) => {
  const navigate = useNavigate();
  const videoRef = useRef();
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(null);
  const [liked, setLiked] = useState(false);
  const [commentList, setCommentList] = useState([]);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.75 }
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const handleCanPlay = async () => {
      try {
        await videoEl.play();
        onPlaySuccess?.();
        setIsLoading(false);
      } catch (err) {
        console.warn("再生エラー:", err);
        setIsLoading(false);
      }
    };

    if (videoEl.readyState >= 3) {
      handleCanPlay();
    } else {
      videoEl.addEventListener("canplay", handleCanPlay);
      return () => videoEl.removeEventListener("canplay", handleCanPlay);
    }
  }, [video.src, onPlaySuccess]);

  useEffect(() => {
    setCommentList([]);
    setLiked(false);
    const fetchData = async () => {
      try {
        const commentsSnap = await getDocs(collection(db, "pixtubePosts", video.id, "comments"));
        setCommentList(commentsSnap.docs.map(doc => doc.data()));

        const reactionSnap = await getDoc(doc(db, "pixtubePosts", video.id, "reactions", profile.userId));
        if (reactionSnap.exists() && reactionSnap.data().like) {
          setLiked(true);
        }
      } catch (e) {
        console.error("リアクション取得エラー:", e);
      }
    };
    fetchData();
  }, [video.id, profile?.userId]);

  const toggleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    try {
      await setDoc(doc(db, "pixtubePosts", video.id, "reactions", profile.userId), {
        like: newLiked,
        userId: profile.userId
      }, { merge: true });

      const newLikeCount = newLiked ? (video.likes || 0) + 1 : (video.likes || 0) - 1;
      await updateDoc(doc(db, "pixtubePosts", video.id), { likes: newLikeCount });
    } catch (e) {
      console.error("いいね失敗:", e);
    }
  };

  const handleSendComment = async () => {
    if (!commentInput.trim() || !profile?.userId) return;

    const newComment = {
      userId: profile.userId,
      userName: profile.userName,
      displayName: profile.displayName,
      profileImage: profile.profileImage || "/default-profile.png",
      text: commentInput,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "pixtubePosts", video.id, "comments"), newComment);
      setCommentInput("");
      setCommentList(prev => [...prev, newComment]);
    } catch (e) {
      console.error("コメント送信エラー:", e);
    }
  };

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setIsPlaying(true);
      triggerPlayIcon(true);
    } else {
      el.pause();
      setIsPlaying(false);
      triggerPlayIcon(false);
    }
  };

  const triggerPlayIcon = (isPlaying) => {
    setShowPlayIcon(isPlaying ? "pause" : "play");
    setTimeout(() => setShowPlayIcon(null), 1000);
  };

  if (!video?.src) {
    console.warn("スキップ：srcがない動画", video);
    return null;
  }

  return (
    <div className={`pixtube-video-wrapper ${isCommentOpen ? "wrapper-shifted" : ""}`}>
      <div className="video-wrapper" onClick={togglePlay}>
        <video
          src={video.src}
          className="pixtube-video"
          autoPlay
          loop
          playsInline
          ref={videoRef}
          muted
        />
        {isLoading && (
          <div className="video-loading-overlay">
            <div className="spinner" />
          </div>
        )}
        {showPlayIcon && (
          <div className="video-overlay-icon show-icon">
            {showPlayIcon === "play" ? <FaPlay /> : <FaPause />}
          </div>
        )}
      </div>
      <div className="back-button" onClick={() => navigate("/pixtube")}> <FaArrowLeft color="white" /> </div>

      <div className="pixtube-actions">
        <div className={`action-button like-button ${liked ? "liked" : ""}`} onClick={toggleLike}>
          <FaHeart />
          <span>{video.likes || 0}</span>
        </div>
        <div className="action-button" onClick={() => setIsCommentOpen(true)}>
          <FaRegCommentDots />
          <span>{commentList.length}</span>
        </div>
        <div className="action-button">
          <FaRetweet />
          <span>共有</span>
        </div>
      </div>

      <div className="pixtube-profile">
        <div className="pixtube-author">{video.author}</div>
        <div className="pixtube-title">{video.title}</div>
      </div>

      {isCommentOpen && (
        <div className="comment-modal">
          <div className="comment-header">
            <span>コメント</span>
            <button onClick={() => setIsCommentOpen(false)}>✕</button>
          </div>
          <div className="comment-input-section">
            <img src={profile?.profileImage || "/default-profile.png"} alt="自分" className="comment-profile-image" />
            <input
              type="text"
              className="comment-input"
              placeholder="コメントを入力..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
            />
            <button className="comment-send-button" onClick={handleSendComment}>📩</button>
          </div>
          <div className="comment-list">
            {commentList.map((comment, idx) => (
              <div key={idx} className="comment-item">
                <img src={comment.profileImage} alt="icon" className="comment-profile-image" />
                <span>@{comment.userName}: {comment.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCard;
