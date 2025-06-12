// PixTubeFeed.js（上下端で即時戻る表示＋初回読み込み除外）
import React, { useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import VideoCard from "./VideoCard";
import { useParams, useNavigate } from "react-router-dom";
import "./PixTube.css";

const PixTubeFeed = ({ profile }) => {
  const { videoId } = useParams();
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);
  const topRef = useRef(null);
  const endRef = useRef(null);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [hasReachedTop, setHasReachedTop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const q = query(collection(db, "pixtubePosts"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setVideos(list.filter((v) => typeof v.src === "string" && v.src.trim() !== ""));
      } catch (e) {
        console.error("動画取得エラー:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, []);

  useEffect(() => {
    const bottomObserver = new IntersectionObserver(
      ([entry]) => {
        setHasReachedEnd(entry.isIntersecting);
      },
      { threshold: 1.0 }
    );

    const topObserver = new IntersectionObserver(
      ([entry]) => {
        setHasReachedTop(entry.isIntersecting);
      },
      { threshold: 1.0 }
    );

    if (endRef.current) bottomObserver.observe(endRef.current);
    if (topRef.current) topObserver.observe(topRef.current);

    return () => {
      bottomObserver.disconnect();
      topObserver.disconnect();
    };
  }, [videos]);

  useEffect(() => {
    if (!videoId || videos.length === 0) return;
    const index = videos.findIndex((v) => v.id === videoId);
    if (index === -1) return;

    const el = containerRef.current?.children[index];
    el?.scrollIntoView({ behavior: "smooth" });
  }, [videoId, videos]);

  const dummyCount = videos.length < 3 ? 3 - videos.length : 0;
  const dummyCards = Array.from({ length: dummyCount }, (_, i) => (
    <div key={`dummy-${i}`} className="pixtube-video-wrapper dummy">
      <div className="dummy-video-card">
        <div className="dummy-thumbnail" />
        <p className="dummy-text">Coming soon...</p>
      </div>
    </div>
  ));

  const showEndOverlay = !isLoading && (videos.length === 0 || hasReachedEnd);
  const showTopOverlay = !isLoading && hasReachedTop;

  return (
    <div ref={containerRef} className="pixtube-container">
      <div ref={topRef}></div>

      {videos.map((video, index) => (
        <div className="pixtube-video-wrapper" key={video.id}>
          <VideoCard
            video={video}
            profile={profile}
            onPlaySuccess={() => {
              setHasReachedEnd(false);
              setHasReachedTop(false);
            }}
          />
        </div>
      ))}

      <div ref={endRef}></div>

      {dummyCards}

      <div className="no-more-videos">これ以上動画はありません</div>

      {!isLoading && (showEndOverlay || showTopOverlay) && (
        <div className="end-overlay">
          <div className="end-message">
            <p>
              {videos.length === 0
                ? "投稿された動画がまだありません。"
                : hasReachedEnd
                ? "これ以上動画はありません。"
                : "これ以上戻れません。"}
            </p>
            <button className="end-button" onClick={() => navigate("/pixtube")}>戻る</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PixTubeFeed;
