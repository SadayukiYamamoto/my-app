import React from "react";
import { Outlet } from "react-router-dom";
import TopBar from '../components/TopBar';
import NavBar from '../components/NavBar';
import BottomBar from '../components/BottomBar';
import Sidebar from '../components/Sidebar';
import FloatingButton from '../components/FloatingButton';
import InformationBanner from '../components/InformationBanner';

const MainLayout = ({ user }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <TopBar />
      <NavBar />
      <InformationBanner />
      <Outlet />  {/* 🔥 ここに各ページが表示される */}
      <FloatingButton />
      <BottomBar />
    </div>
  );
};

export default MainLayout;
