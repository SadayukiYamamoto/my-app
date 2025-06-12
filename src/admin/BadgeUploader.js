import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export default function BadgeUploader({ onUpload }) {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    const fileRef = ref(storage, `badges/${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    onUpload(url);
    alert("画像をアップロードしました！");
  };

  return (
    <div>
      <h3>🖼️ バッジ画像アップロード</h3>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>アップロード</button>
    </div>
  );
}
