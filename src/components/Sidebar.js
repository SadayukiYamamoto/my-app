import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';  // 🆕 Link をインポート！
import './TopSidebar.css';
import { FaBars, FaTimes } from 'react-icons/fa';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);  // サブメニュー用
  const sidebarRef = useRef(null);

  // サイドバーの開閉切り替え
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // サブメニューの開閉切り替え
  const toggleSubMenu = () => {
    setIsSubMenuOpen(!isSubMenuOpen);
  };

  // サイドバー外をクリックしたら閉じる
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsSubMenuOpen(false);  // サブメニューも閉じる
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="menu-icon" onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>
      <div
        className={`sidebar ${isOpen ? 'open' : ''}`}
        ref={sidebarRef}
      >
        <ul>
          {/* 🆕 Link を使ってホームへ移動できるようにする */}
          <li><Link to="/" onClick={toggleSidebar}>ホーム</Link></li>
          <li><Link to="/report" onClick={toggleSidebar}>報告物</Link></li>
          <li>
            <a href="#" onClick={toggleSubMenu}>
              個人実績 {isSubMenuOpen ? '▲' : '▼'}
            </a>
            <ul className={`submenu ${isSubMenuOpen ? 'open' : ''}`}>
              <li><a href="#">Akiba</a></li>
              <li><a href="#">Yokohama</a></li>
              <li><a href="#">Umeda</a></li>
              <li><a href="#">Kyoto</a></li>
              <li><a href="#">Hakata</a></li>
              <li><a href="#">Sendai</a></li>
              <li><a href="#">Shinjuku</a></li>
              <li><a href="#">Kichijoji</a></li>
              <li><a href="#">Kawasaki</a></li>
              <li><a href="#">Sapporo</a></li>
            </ul>
          </li>
          <li><a href="#">お知らせ</a></li>
          <li><Link to="/Visitor" onClick={toggleSidebar}>集客数カウント</Link></li>
          <li><a href="#">販売数</a></li>
          <li><a href="#">シフト</a></li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
