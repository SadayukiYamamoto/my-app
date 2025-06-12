import React, { useState } from 'react';
import BadgeUploader from './BadgeUploader';
import BadgeAssignment from './BadgeAssignment';
import AdminPointManager from './AdminPointManager';

export default function AdminDashboard() {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🎖️ バッジ管理画面</h2>
      <BadgeUploader onUpload={(url) => setImageUrl(url)} />
      <BadgeAssignment imageUrl={imageUrl} />
      
      <hr style={{ margin: "2rem 0" }} />
      <h2>🎯 ポイント管理</h2>
      <AdminPointManager />
    </div>
  );
}