// src/pages/NoticePage.js
import React from 'react';
import notices from '../data/notices.json';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './NoticePage.css';
import { FaTimes, FaArrowLeft } from 'react-icons/fa';

const NoticePage = () => {
  return (
    <div className="notice-page">
      <h2 className="notice-title">おしらせ</h2>
      <div className="notice-list">
        {notices.map((notice, index) => (
          <Link to={`/notice/${index}`} key={index} className="notice-card">
            <img src={notice.imageUrl} alt="お知らせ画像" className="notice-image" />
            <div className="notice-info">
              <span className={`notice-label ${notice.type}`}>{notice.typeLabel}</span>
              <span className="notice-date">{notice.date}</span>
              <h3 className="notice-item-title">{notice.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export const NoticeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notice = notices[parseInt(id)];

  if (!notice) return <div>お知らせが見つかりませんでした。</div>;

  return (
    <div className="notice-detail">
      <div className="notice-header">
        <h2 className="notice-title">おしらせ</h2>
        <button className="icon-button" onClick={() => navigate(-1)}>
          <FaTimes size={24} />
        </button>
      </div>
      <div className="notice-content">
        <img src={notice.imageUrl} alt="詳細画像" className="notice-detail-image" />
        <div className="notice-detail-info">
          <span className={`notice-label ${notice.type}`}>{notice.typeLabel}</span>
          <span className="notice-date">{notice.date}</span>
          <h3 className="notice-item-title">{notice.title}</h3>
          <p className="notice-text">
            いつも「Pokémon Trading Card Game Pocket」をご利用いただきありがとうございます。
            <br />プレミアムミッションに新しいプロモカードが登場
          </p>
          <img src={notice.imageUrl} alt="カード" className="notice-card-image" />
          <p className="notice-card-label">ゼラオラ</p>
          <p className="notice-footer">詳細は、ミッション画面にてご確認ください。</p>
        </div>
        <div className="notice-detail-header">
  <button className="back-button" onClick={() => navigate(-1)}>
    <FaArrowLeft size={20} />
    <span>おしらせ</span>
  </button>
</div>
      </div>
    </div>
  );
};

export default NoticePage;
