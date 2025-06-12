import React from 'react';
import './ReportVisitor.css';  // ✅ CSSを読み込む

// ✅ スペースをアンダースコアに変更してインポート 🖼️
import ReportViditorAkiba from '../assets/集客カウント_Akiba.png';
import ReportViditorYokohama from '../assets/集客カウント_Yokohama.png';
import ReportViditorUmeda from '../assets/集客カウント_Umeda.png';
import ReportViditorKyoto from '../assets/集客カウント_Kyoto.png';
import ReportViditorHakata from '../assets/集客カウント_Hakata.png';
import ReportViditorSendai from '../assets/集客カウント_Sendai.png';

const ReportPage = () => {
  return (
    <div className="report-page">
      <h2>集客カウント</h2>
      <div className="report-grid">  {/* ✅ グリッドコンテナ */}

        <div className="report-item">
          <a href="https://docs.google.com/spreadsheets/d/1b8gEjzy0Mg5NKwAl4rlYFYCRy9qds7yC9TnONnNMyx0/edit?usp=drive_link" target="_blank" rel="noopener noreferrer">
            <img src={ReportViditorAkiba} alt="集客カウントAkiba" />
          </a>
        </div>

        <div className="report-item">
          <a href="https://docs.google.com/spreadsheets/d/1tmDYhuIJOopSzz78Teop1T74vLFRY30JND1r2bp63Lc/edit?usp=drive_link" target="_blank" rel="noopener noreferrer">
            <img src={ReportViditorYokohama} alt="集客カウントYokohama" />
          </a>
        </div>

        <div className="report-item">
          <a href="https://docs.google.com/spreadsheets/d/1p_LZir6M6FB9_OOaK_ksBnUxGaHeyeZLKxqGHDo1baw/edit?usp=drive_link" target="_blank" rel="noopener noreferrer">
            <img src={ReportViditorUmeda} alt="集客カウントUmeda" />
          </a>
        </div>

        <div className="report-item">
          <a href="https://docs.google.com/spreadsheets/d/1dnA1Uxinh8sE2QIRs1cFOWiLONmUlGxxVv6giCSCGCA/edit?usp=drive_link" target="_blank" rel="noopener noreferrer">
            <img src={ReportViditorKyoto} alt="集客カウントKyoto" />
          </a>
        </div>

        <div className="report-item">
          <a href="https://docs.google.com/spreadsheets/d/1FT9eKf-t8Dym641al7kZUftIcXTccV_8jD3_EUItTRk/edit?usp=drive_link" target="_blank" rel="noopener noreferrer">
            <img src={ReportViditorHakata} alt="集客カウントHakata" />
          </a>
        </div>

        <div className="report-item">
          <a href="https://docs.google.com/spreadsheets/d/13YUbd01YpnnCbSBZGdEdn8Ek96-fY4Q2-2B-rMAzYaE/edit?usp=drive_link" target="_blank" rel="noopener noreferrer">
            <img src={ReportViditorSendai} alt="集客カウントSendai"/>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
