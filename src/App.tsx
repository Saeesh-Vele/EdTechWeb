import React, { type FC } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { useToast } from "./hooks/useToast";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";

import LandingPage from "./pages/LandingPage/LandingPage";
import AuthPage from "./pages/AuthPage/AuthPage";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import DashboardOverview from "./pages/DashboardPage/DashboardOverview/DashboardOverview";
import AllCourses from "./pages/DashboardPage/AllCourses/AllCourses";
import MyCoursesList from "./pages/DashboardPage/MyCourses/MyCoursesList";
import CourseDetail from "./pages/DashboardPage/MyCourses/CourseDetail";
import SkillDetail from "./pages/DashboardPage/MyCourses/SkillDetail";
import GameRoadmap from "./pages/DashboardPage/RoadMaps/GameRoadmap/GameRoadmap";
import BackendRoadmap from "./pages/DashboardPage/RoadMaps/Backend/BackendRoadmap";
import AndroidRoadmap from "./pages/DashboardPage/RoadMaps/Android/AndroidRoadmap";
import FullStackRoadmap from "./pages/DashboardPage/RoadMaps/FullStack/FullStackRoadmap";
import DevOpsRoadmap from "./pages/DashboardPage/RoadMaps/DevOps/DevOps";
import DataAnalystRoadmap from "./pages/DashboardPage/RoadMaps/DataAnalyst/DataAnalyst";
import AIEngineerRoadmap from "./pages/DashboardPage/RoadMaps/AiEngineer/AiEngineer";
import DataEngineerRoadmap from "./pages/DashboardPage/RoadMaps/DataEngineer/DataEngineer";
import MachineLearningRoadmap from "./pages/DashboardPage/RoadMaps/MachineLearning/MachineLearning";
import IOSRoadmap from "./pages/DashboardPage/RoadMaps/IosDevloper/IosDevloper";
import BlockchainRoadmap from "./pages/DashboardPage/RoadMaps/BlockChain/BlockChain";
import MLOpsRoadmap from "./pages/DashboardPage/RoadMaps/MlOps/MlOps";
import Assessments from "./pages/Assessments/Assessments";

import Revision from "./pages/Revision/Revision";

import Layout from "./components/Layout";
import { ToastContainer } from "./components/Toast/Toast";

declare global {
  interface Window {
    voiceflow: any;
  }
}

/* ─── Protected Route ─────────────────────────────────────── */
const ProtectedRoute: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const App: FC = () => {
  const { toasts, showToast } = useToast();

  useEffect(() => {
    // Prevent duplicate script injection
    if (document.getElementById("voiceflow-chat")) return;

    const script = document.createElement("script");
    script.id = "voiceflow-chat";
    script.src = "https://cdn.voiceflow.com/widget/bundle.mjs";
    script.type = "text/javascript";
    script.async = true;

    script.onload = () => {
      window.voiceflow.chat.load({
        verify: { projectID: "69c8b94a02537c88dc024073" }, // extracted from your link
        url: "https://general-runtime.voiceflow.com",
        versionID: "production"
      });
    };

    document.body.appendChild(script);
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage showToast={showToast} />} />

        <Route path="/auth" element={<AuthPage showToast={showToast} />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage showToast={showToast} />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="allcourses" element={<AllCourses />} />
          <Route path="my-courses" element={<MyCoursesList />} />
          <Route path="my-courses/:courseName" element={<CourseDetail />} />
          <Route path="my-courses/:courseName/:skillName" element={<SkillDetail />} />
          <Route path="roadmap/game" element={<GameRoadmap />} />
          <Route path="roadmap/backend" element={<BackendRoadmap />} />
          <Route path="roadmap/android" element={<AndroidRoadmap />} />
          <Route path="roadmap/fullstack" element={<FullStackRoadmap />} />
          <Route path="roadmap/devops" element={<DevOpsRoadmap />} />
          <Route path="roadmap/data-analyst" element={<DataAnalystRoadmap />} />
          <Route path="roadmap/ai-engineer" element={<AIEngineerRoadmap />} />
          <Route path="roadmap/data-engineer" element={<DataEngineerRoadmap />} />
          <Route path="roadmap/machine-learning" element={<MachineLearningRoadmap />} />
          <Route path="roadmap/ios" element={<IOSRoadmap />} />
          <Route path="roadmap/blockchain" element={<BlockchainRoadmap />} />
          <Route path="roadmap/mlops" element={<MLOpsRoadmap />} />
          <Route path="assessments" element={<Assessments />} />
          <Route path="revision" element={<Revision />} />
        </Route>
      </Routes>
      <ToastContainer toasts={toasts} />
    </>
  );
};

export default App;