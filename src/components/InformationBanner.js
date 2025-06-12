import React from 'react';
import './InformationBanner.css';

const InformationBanner = ({ scrollDirection }) => {
  return (
    <div
      data-cy="information-banner"
      className={`information-banner ${scrollDirection === "down" ? "banner-hidden" : ""}`}
    >
      <a
        data-cy="information-banner-anchor"
        href="https://drive.google.com/file/d/1gKh5a15cAboEPxC8a37ktGTghrI_cfKO/view?usp=drive_link"
        target="_blank"
        rel="noopener noreferrer"
        className="information-banner-link"
      >
        <div className="banner-content">
          <div className="banner-text">
            <p>【事務局だよりNo.66】お待たせしました！写真比較回です！</p>
          </div>
          <div className="banner-avatar">
            <img
              data-cy="avatar-image"
              src="https://commmune.imgix.net/env/production/brandId/2450/559d2e00-47e2-11ef-b129-e36a1d1f4347.jpg"
              alt="Avatar"
              width="20"
              height="20"
            />
          </div>
        </div>
      </a>
    </div>
  );
};

export default InformationBanner;
