// components/BadgeItem.js
import React from "react";
import "./BadgeItem.css";

export default function BadgeItem({ imageUrl, badgeName }) {
  return (
    <div className="badge-wrapper">
      <div className="badge-base">
        <img src="/badge-stand.png" alt="stand" className="badge-stand" />
        <img src={imageUrl} alt={badgeName} className="badge-icon" />
      </div>
      <div className="badge-label">{badgeName}</div>
    </div>
  );
}