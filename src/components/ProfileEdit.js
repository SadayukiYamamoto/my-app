// ✅ 修正済：プロフィール画像保存後に即時反映＆ヘッダー画像もトリミング対応

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.min.css";
import "./ProfileEdit.css";
import { FaPlus } from 'react-icons/fa';


const storeOptions = [
  "ヨドバシカメラ マルチメディア Akiba",
  "ヨドバシカメディア マルチメディア横浜",
  "ヨドバシカメディア マルチメディア梅田",
  "ヨドバシカメディア マルチメディア京都",
  "ヨドバシカメディア マルチメディア博多",
  "ヨドバシカメディア マルチメディア仙台",
  "ヨドバシカメディア マルチメディア新宿西口",
  "ヨドバシカメディア マルチメディア吉祥寺",
  "ヨドバシカメディア マルチメディア川崎ルフロン",
  "ヨドバシカメディア マルチメディア札幌"
];

const hobbyOptions = ["PCゲーム", "スマホゲーム", "Nintendo Switch", "PS4 PS5", "カフェ巡り", "カメラ", "野球（やる＆見る）", "サッカー（やる＆見る）", "バレー（やる＆見る）", "バスケ（やる＆見る）", "コーヒー", "イラスト", "馬", "ペット", "トランポリン", "筋トレ", "旅行", "マリンスポーツ", "ディズニー", "ユニバーサルスタジオジャパン", "ピューロランド", "ハーモニーランド", "家電", "プログラミング", "歌（やる＆聞く）", "音楽（やる＆聞く）", "料理（作る＆食べる）", "ボードゲーム", "観葉植物", "サウナ", "温泉", "映画", "アニメ", "漫画", "ゲームセンター", "ドライブ", "ラーメン", "キン肉マン", "キャンプ", "バイク", "アウトドア"];

const ProfileEdit = ({ user, profile }) => {
  const [profileImage, setProfileImage] = useState(profile?.profileImage || "");
  const [headerImage, setHeaderImage] = useState(profile?.headerImage || "");
  const [tempImage, setTempImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [cropMode, setCropMode] = useState("profile");
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState(profile?.userName || "");
  const [storeNames, setStoreNames] = useState(profile?.storeNames || []);
  const [hobbies, setHobbies] = useState(profile?.hobbies || []);
  const [pixelProduct, setPixelProduct] = useState(profile?.pixelProduct || "");
  const [otherHobby, setOtherHobby] = useState(profile?.otherHobby || "");
  const [introduction, setIntroduction] = useState(profile?.introduction || "");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const headerInputRef = useRef(null);
  const cropperRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileImage(data.profileImage || "");
          setHeaderImage(data.headerImage || "");
          setDisplayName(data.displayName || "");
          setUserName(data.userName || "");
          setStoreNames(data.storeNames || []);
          setHobbies(data.hobbies || []);
          setPixelProduct(data.pixelProduct || "");
          setOtherHobby(data.otherHobby || "");
          setIntroduction(data.introduction || "");
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setTempImage(reader.result);
          setCropMode("profile");
          setIsModalOpen(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeaderChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setTempImage(reader.result);
          setCropMode("header");
          setIsModalOpen(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = () => {
    if (cropperRef.current) {
      const cropper = cropperRef.current.cropper;
      cropper.getCroppedCanvas({
        width: cropMode === "header" ? 800 : 300,
        height: cropMode === "header" ? 150 : 300
      }).toBlob((blob) => {
        if (cropMode === "profile") {
          setCroppedImage(blob);
          const previewURL = URL.createObjectURL(blob);
          setProfileImage(previewURL);
        } else {
          uploadHeaderBlob(blob);
        }
        setIsModalOpen(false);
      });
    }
  };

  const uploadHeaderBlob = async (blob) => {
    if (!user) return;
    const storageRef = ref(storage, `headerImages/${user.uid}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);
    uploadTask.on("state_changed", null, console.error, async () => {
      const url = await getDownloadURL(uploadTask.snapshot.ref);
      setHeaderImage(url);
      await setDoc(doc(db, "users", user.uid), { headerImage: url }, { merge: true });
    });
  };

  const handleSave = async () => {
    if (user) {
      const docRef = doc(db, "users", user.uid);
      if (croppedImage) {
        const storageRef = ref(storage, `profileImages/${user.uid}`);
        const uploadTask = uploadBytesResumable(storageRef, croppedImage);
        uploadTask.on("state_changed", null, console.error, async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setProfileImage(url);
          await setDoc(docRef, {
            profileImage: url,
            headerImage,
            displayName,
            userName,
            storeNames,
            pixelProduct,
            hobbies,
            otherHobby,
            introduction
          }, { merge: true });
          alert("プロフィールが更新されました！");
          navigate("/mypage");
        });
      } else {
        await setDoc(docRef, {
          profileImage,
          headerImage,
          displayName,
          userName,
          storeNames,
          pixelProduct,
          hobbies,
          otherHobby,
          introduction
        }, { merge: true });
        alert("プロフィールが更新されました！");
        navigate("/mypage");
      }
    }
  };

  return (
    <div className="profile-container card-root m-3">
<div className="profile-header-bar">
  <h2 className="profile-header-title">プロフィール編集</h2>
  <button onClick={handleSave} className="profile-save-button-top">保存</button>
</div>


   <div className="profile-header-wrapper">
  <label className="header-image-label">
    <img
      src={headerImage || "/default-header.jpg"}
      alt="ヘッダー"
      className="mypage-header-image"
    />
    <input
      type="file"
      ref={headerInputRef}
      className="hidden-input"
      accept="image/*"
      onChange={handleHeaderChange}
    />
    <div className="header-icon-overlay">
      <FaPlus />
    </div>
  </label>
</div>


      <div className="profile-image-wrapper">
  <label className="profile-image-label">
    <img
      src={profileImage || "https://picsum.photos/100"}
      alt="プロフィール"
      className="profile-image"
    />
    <input
      type="file"
      ref={fileInputRef}
      className="hidden-input"
      accept="image/*"
      onChange={handleImageChange}
    />
    <div className="camera-icon-overlay">
  <FaPlus />
</div>
  </label>
</div>
      {isModalOpen && tempImage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            <h3>画像のトリミング</h3>
            <Cropper
              src={tempImage}
              style={{ height: 400, width: "100%" }}
              initialAspectRatio={cropMode === "header" ? 800 / 150 : 1}
              aspectRatio={cropMode === "header" ? 800 / 150 : 1}
              guides={false}
              ref={cropperRef}
            />
            <button className="modal-button" onClick={handleCrop}>保存</button>
          </div>
        </div>
      )}
      <label className="profile-label">①表示名（60文字以内）</label>
      <input type="text" maxLength="60" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="profile-input" />
      <label className="profile-label">②ユーザー名（4〜30文字、半角英数字）</label>
      <input type="text" pattern="[a-zA-Z0-9]+" minLength="4" maxLength="30" value={userName} onChange={(e) => setUserName(e.target.value)} className="profile-input" />
      <label className="profile-label">③店舗名（複数選択可）</label>
      {storeOptions.map((store) => (
        <div key={store} className="profile-checkbox-container">
          <input type="checkbox" className="profile-checkbox" checked={storeNames.includes(store)} onChange={() => setStoreNames(prev => prev.includes(store) ? prev.filter(s => s !== store) : [...prev, store])} />
          <label className="profile-checkbox-label">{store}</label>
        </div>
      ))}
      <label className="profile-label">④利用しているPixel製品</label>
      <input type="text" value={pixelProduct} onChange={(e) => setPixelProduct(e.target.value)} className="profile-input" />
      <label className="profile-label">⑤趣味、好きなもの（複数選択可）</label>
      {hobbyOptions.map((hobby) => (
        <div key={hobby} className="profile-checkbox-container">
          <input type="checkbox" className="profile-checkbox" checked={hobbies.includes(hobby)} onChange={() => setHobbies(prev => prev.includes(hobby) ? prev.filter(h => h !== hobby) : [...prev, hobby])} />
          <label className="profile-checkbox-label">{hobby}</label>
        </div>
      ))}
      <label className="profile-label">⑥自己紹介（500文字以内）</label>
      <textarea maxLength="500" value={introduction} onChange={(e) => setIntroduction(e.target.value)} className="profile-input" />
    </div>
  );
};

export default ProfileEdit;
