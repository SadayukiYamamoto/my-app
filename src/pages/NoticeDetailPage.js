import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import notices from '../data/notices.json';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';
import './NoticeDetailPage.css';

const NoticeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const noticeId = parseInt(id, 10);
  const notice = notices[noticeId];

  if (isNaN(noticeId) || !notice) {
    return <p>お知らせが見つかりません</p>;
  }

  return (
    <div className="notice-detail-container">
      <div className="notice-header">
        <h2 className="notice-title">おしらせ</h2>
        <FaTimes className="close-icon" onClick={() => navigate(-1)} />
      </div>

      <div className="notice-image-wrapper">
        <img src={notice.imageUrl} alt="お知らせ画像" className="main-image" />
      </div>

      <div className="notice-body">
        <div className="notice-meta">
          <span className={`notice-type ${notice.type}`}>{notice.typeLabel}</span>
          <span className="notice-date">{notice.date}</span>
        </div>
        <h3 className="notice-detail-title">{notice.title}</h3>

        <p className="notice-text">
          {notice.body.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </p>

        {notice.buttonUrl && (
          <a
            href={notice.buttonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="promo-card"
          >
            <img src={notice.imageUrl} alt="カード" className="promo-image" />
            <p className="card-label">{notice.buttonLabel || "詳細"}</p>
          </a>
        )}

        <p className="notice-footer">詳細は、Google Chatをご覧ください。</p>

        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> 戻る
        </button>
      </div>
    </div>
  );
};

export default NoticeDetailPage;
