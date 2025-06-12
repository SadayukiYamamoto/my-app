//App.js
import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation,useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import TopBar from "./components/TopBar";
import NavBar from "./components/NavBar";
import BottomBar from "./components/BottomBar";
import Sidebar from "./components/Sidebar";
import FloatingButton from "./components/FloatingButton";
import PostForm from "./pages/PostForm";
import ReportPage from "./pages/ReportPage";
import InformationBanner from "./components/InformationBanner";
import ReportVisitor from "./pages/ReportVisitor";
import Login from "./components/Login";
import MyPage from "./components/MyPage";
import ProfileEdit from "./components/ProfileEdit";
import { auth, onAuthStateChanged, db } from "./firebase";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import './App.css';
import Pitter from "./pages/Pitter";
import Home from './components/Home';
import PixTubeHome from "./pages/PixTubeHome";
import PixTube from "./pages/PixTube";
import NoticePage from './pages/NoticePage';
import NotificationsPage from './components/NotificationsPage';
import { AuthProvider } from './hooks/useAuth';
import PostDetail from './pages/PostDetail';
import NoticeDetailPage from './pages/NoticeDetailPage';
import FloatingWriteButton from './components/FloatingWriteButton';
import TreasurePage from './pages/TreasurePage';
import WritePage from './pages/WritePage';
import PostForm2 from './pages/PostForm2';
import TreasureCategoryList from './pages/TreasureCategoryList';
import TreasurePostDetail from './pages/TreasurePostDetail';
import AdminDashboard from './admin/AdminDashboard';
import AdminPixTubePanel from "./admin/AdminPixTubePanel";
import PixTubeFeed from "./pages/PixTubeFeed";

const theme = createTheme();

function AppWrapper() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showBottomBar, setShowBottomBar] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setProfile(null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile({
            userId: user.uid,  // 🔴 明示的に userId を追加！
            ...docSnap.data()
          });
        }
      }
    };
    fetchProfile();
  }, [user]);

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
        <AppRoutes user={user} profile={profile} showBottomBar={showBottomBar} setShowBottomBar={setShowBottomBar} />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppRoutes({ user, profile, showBottomBar, setShowBottomBar }) {
  const location = useLocation();
  const navigate = useNavigate();


  const isPostFormPage = location.pathname === "/post";
  const isPostDetailPage = location.pathname.startsWith("/post/");
  const isTreasureWritePage = location.pathname === "/treasure/write";
  
  const isNoSidebar =
    isPostFormPage || isPostDetailPage || isTreasureWritePage || ["/mypage", "/profile-edit"].includes(location.pathname);
  const isNoTopBar =
    isPostFormPage || isPostDetailPage || isTreasureWritePage;
  const isBannerHidden =
    isNoTopBar || location.pathname.startsWith("/profile/");
  const isNoFloatingButton =
    isPostFormPage || isPostDetailPage || isTreasureWritePage;
  const isNoBottomBar = isTreasureWritePage;


  const [unreadCount, setUnreadCount] = useState(0);
  const [scrollDirection, setScrollDirection] = useState("up");
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection("up");
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notices"),
      where("toUserId", "==", user.uid),
      where("isRead", "==", false)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (
      !location.pathname.startsWith("/post/") &&
      !location.pathname.startsWith("/treasure/write")
    ) {
      setShowBottomBar(true);
    }
  }, [location.pathname]);

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      {!isNoSidebar && <Sidebar />}
      {!isNoTopBar && (
        <TopBar
          user={user}
          profile={profile}
          unreadCount={unreadCount}
          scrollDirection={scrollDirection}
        />
      )}
      {!isBannerHidden && (
        <InformationBanner scrollDirection={scrollDirection} />
      )}

      <Routes>
        <Route path="/home" element={<Home user={user} profile={profile} />} />
        <Route path="/" element={<Navigate to="/mypage" />} />
        <Route path="/mypage" element={<MyPage user={user} profile={profile} />} />
        <Route path="/profile-edit" element={<ProfileEdit user={user} profile={profile} />} />
        <Route path="/post" element={<PostForm />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/visitor" element={<ReportVisitor />} />
        <Route path="/pitter" element={<Pitter scrollDirection={scrollDirection} setShowBottomBar={setShowBottomBar} />} />
        <Route path="/pixtube" element={
        <PixTubeHome onSelectVideo={(video) => navigate(`/pixtube/${video.id}`)} />
      } />
        <Route path="/pixtube/:videoId" element={profile ? <PixTube profile={profile} /> : <div>読み込み中...</div>} />
        <Route path="/notice" element={<NoticePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/notice/:id" element={<NoticeDetailPage />} />
        <Route path="/profile/:userId" element={<MyPage />} />
        <Route path="/treasure" element={<TreasurePage />} />
        <Route path="/treasure/:category" element={<TreasureCategoryList />} />
        <Route path="/treasure/:category/:postId" element={<TreasurePostDetail />} />
        <Route path="/treasure/write/*" element={<PostForm2 />} /> {/* ←これ必要 */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/pixtube" element={<AdminPixTubePanel />} />
        <Route path="/shorts" element={<PixTubeFeed profile={profile} />} />

      </Routes>
      {!isNoFloatingButton && (
  location.pathname.startsWith("/treasure") ? (
    <FloatingWriteButton />
  ) : (
    <FloatingButton scrollDirection={scrollDirection} />
  )
)}


{!isNoFloatingButton && (
  location.pathname.startsWith("/treasure") ? (
    <FloatingWriteButton />
  ) : (
    <FloatingButton scrollDirection={scrollDirection} />
  )
)}



{!isTreasureWritePage && showBottomBar && <BottomBar scrollDirection={scrollDirection} />}

    </div>
  );
}

export default AppWrapper;
