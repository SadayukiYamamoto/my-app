// src/components/Banner.js
import React from 'react';
import './Banner.css';

const Banner = ({ scrollDirection }) => {
  return (
    <div className={`appBanner ${scrollDirection === "down" ? "banner-hidden" : ""}`}>
      <img src="/app_banner.jpg" className="appBanner-img" alt="App Banner" />
    </div>
  );
};

export default Banner;