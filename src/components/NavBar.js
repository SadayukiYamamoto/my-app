// src/components/NavBar.js
import React from 'react';
import './NavBar.css';
import { Link } from 'react-router-dom';

const NavBar = ({ scrollDirection }) => {
  return (
    <nav className={`navbar ${scrollDirection === "down" ? "nav-hidden" : ""}`}>
      <ul className="navbar-links">
        <li><Link to="/home" className="navbar-link">ホーム</Link></li>
        <li><Link to="/mypage" className="navbar-link">マイページ</Link></li>
        <li><Link to="/pitter" className="navbar-link">Pitter</Link></li>
        <li><Link to="/pixtube" className="navbar-link">PixTube</Link></li>
        <li><Link to="/spoint" className="navbar-link">Spoint 獲得!?</Link></li>
        <li><Link to="/event" className="navbar-link">イベント</Link></li>
        <li><Link to="/shop" className="navbar-link">PixelShop Q&A</Link></li>
        <li><Link to="/treasure" className="navbar-link">ノウハウ宝物庫</Link></li>
      </ul>
    </nav>
  );
};

export default NavBar;