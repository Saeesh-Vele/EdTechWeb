import React, { type FC } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { useToast } from "./hooks/useToast";

import AuthPage from "./pages/AuthPage/AuthPage";
import DashboardOverview from "./pages/DashboardPage/DashboardOverview/DashboardOverview";
import AllCourses from "./pages/DashboardPage/AllCourses/AllCourses";
import GameRoadmap from "./pages/DashboardPage/RoadMaps/GameRoadmap/GameRoadmap";
import Assessments from "./pages/Assessments/Assessments";

import Layout from "./components/Layout";
import { ToastContainer } from "./components/Toast/Toast";

const App: FC = () => {
  const { toasts, showToast } = useToast();

  return (
    <>
      <Routes>
        {/* Default Redirect to Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/auth" element={<AuthPage showToast={showToast} />} />

        {/* Protected Routes Wrapper */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/dashboard/allcourses" element={<AllCourses />} />
          <Route path="/dashboard/roadmap/game" element={<GameRoadmap />} />
          <Route path="/assessments" element={<Assessments />} />
        </Route>
      </Routes>
      <ToastContainer toasts={toasts} />
    </>
  );
};

export default App;