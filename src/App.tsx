import React, { type FC } from "react";
import { Routes, Route } from "react-router-dom";
import "./index.css";
import { useToast } from "./hooks/useToast";

import LandingPage from "./pages/LandingPage/LandingPage";
import AuthPage from "./pages/AuthPage/AuthPage";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import DashboardOverview from "./pages/DashboardPage/DashboardOverview/DashboardOverview";
import AllCourses from "./pages/DashboardPage/AllCourses/AllCourses";
import GameRoadmap from "./pages/DashboardPage/RoadMaps/GameRoadmap/GameRoadmap";

import { ToastContainer } from "./components/Toast/Toast";

const App: FC = () => {
  const { toasts, showToast } = useToast();

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage showToast={showToast} />} />
        <Route path="/auth" element={<AuthPage showToast={showToast} />} />
        
        <Route path="/dashboard" element={<DashboardPage showToast={showToast} />}>
          <Route index element={<DashboardOverview />} />
          <Route path="allcourses" element={<AllCourses />} />
          <Route path="roadmap/game" element={<GameRoadmap />} />
        </Route>
      </Routes>
      <ToastContainer toasts={toasts} />
    </>
  );
};

export default App;