import React from 'react';
import './ReportVisitor.css';  // 🆕 CSSを読み込む

import KintaiKanri from '../assets/勤怠管理.png';
import SisakuNyuryokuForm from '../assets/施策入力フォーム.png';
import SekkyakuReport from '../assets/接客レポート.png';

const ReportPage = () => {
  return (
    <div className="report-page">
      <h2>共通報告物</h2>
      <div className="report-grid">  {/* 🆕 グリッドコンテナ */}
        <div className="report-item">
          <a href="https://docs.google.com/forms/d/e/1FAIpQLScLsB7BxGpyGKGhk-o5q05Fft9_DKk_1ZcSWm5437wUU9Qm_w/viewform" target="_blank" rel="noopener noreferrer">
            <img src={KintaiKanri} alt="勤怠管理" />
          </a>
        </div>

        <div className="report-item">
          <a href="https://docs.google.com/forms/d/e/1FAIpQLScXWz7eEi1Em3ya8HcG6D8Hd86kE5mRz-52hTPp5STMHwfEAw/viewform" target="_blank" rel="noopener noreferrer">
            <img src={SisakuNyuryokuForm} alt="施策入力フォーム" />
          </a>
        </div>

        <div className="report-item">
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSe6kUrff8jDDOke26eeRl02nPNnShTyaqQ5Itg0jn18Xgq6IA/viewform" target="_blank" rel="noopener noreferrer">
            <img src={SekkyakuReport} alt="接客レポート" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
