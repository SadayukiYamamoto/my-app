/* src/components/TopBar.js */
import React from 'react';
import './TopBar.css';
import { FaHome, FaBell, FaComments, FaBars } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const TopBar = ({ user, profile, unreadCount, scrollDirection }) => {
  const navigate = useNavigate();

  console.log("TopBar に渡された user:", user);
  console.log("TopBar に渡された profile:", profile);

  // ✅ FirestoreのURLにtimestampを付けてキャッシュ防止（? がすでに含まれている場合にも対応）
  const getProfileImageUrl = () => {
    if (profile?.profileImage) {
      const separator = profile.profileImage.includes('?') ? '&' : '?';
      return `${profile.profileImage}${separator}timestamp=${new Date().getTime()}`;
    }
    return "https://picsum.photos/100"; // デフォルト画像
  };

  const profileImage = getProfileImageUrl();

  return (
    <div className={`top-bar ${scrollDirection === "down" ? "topbar-hidden" : ""}`}>
      <div className="top-bar-left">
      <FaBars
  className={`hamburger-menu ${scrollDirection === "down" ? "topbar-hidden" : ""}`}
  title="メニュー"
/>
        <Link to="/home">
          <FaHome className="top-bar-icon" title="ホーム" />
        </Link>
      </div>
      <div className="top-bar-right">
      <div className="relative">
  <FaBell
    className="top-bar-icon"
    title="通知"
    onClick={() => navigate("/notifications")}
  />
  {unreadCount > 0 && (
    <span className="notification-badge">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )}
</div>
  <FaComments className="top-bar-icon" title="チャット" />
  <img
    src={profileImage}
    alt="プロフィール"
    className="top-bar-profile-image"
    onClick={() => navigate("/mypage")}
    onError={(e) => {
      e.target.src = "https://picsum.photos/100";
    }}
  />
</div>

    </div>
  );
};

export default TopBar;

