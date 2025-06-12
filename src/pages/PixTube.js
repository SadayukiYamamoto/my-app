// src/pages/PixTube.js
import React from "react";
import PixTubeFeed from "./PixTubeFeed"; // ✅ 動画一覧コンポーネント

const PixTube = ({ profile }) => {
  return <PixTubeFeed profile={profile} />;
};

export default PixTube;