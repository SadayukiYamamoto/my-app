// src/components/BottomBar.js
import React from 'react';
import './BottomBar.css';
import { FaHome, FaTwitter, FaUser, FaBullhorn, FaYoutube, FaBook } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const BottomBar = ({ scrollDirection }) => {
  return (
    <div className={`bottom-bar ${scrollDirection === "down" ? "bottombar-hidden" : ""}`}>
      <Link to="/home" className="bottom-link">
        <FaHome className="bottom-bar-icon" title="ホーム" />
      </Link>
      <Link to="/notice" className="bottom-link">
        <FaBullhorn className="bottom-bar-icon" title="おしらせ" />
      </Link>
      <Link to="/pitter" className="bottom-link">
        <FaTwitter className="bottom-bar-icon" title="Pitter" />
      </Link>
      <Link to="/pixtube" className="bottom-link">
        <FaYoutube className="bottom-bar-icon" title="マイページ" />
      </Link>
      <Link to="/treasure" className="bottom-link">
        <FaBook className="bottom-bar-icon" title="マイページ" />
      </Link>
      <Link to="/mypage" className="bottom-link">
        <FaUser className="bottom-bar-icon" title="マイページ" />
      </Link>
    </div>
  );
};

export default BottomBar;