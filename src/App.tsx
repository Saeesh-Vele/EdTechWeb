import React, { useState, useCallback, type FC } from "react";
import "./index.css";
import type { Page } from "./types";
import { useToast } from "./hooks/useToast";
import LandingPage from "./pages/LandingPage/LandingPage";
import AuthPage from "./pages/AuthPage/AuthPage";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import { ToastContainer } from "./components/Toast/Toast";

const App: FC = () => {
  const [page, setPage] = useState<Page>("landing");
  const { toasts, showToast } = useToast();

  const navigate = useCallback((p: Page) => {
    setPage(p);
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {page === "landing"   && <LandingPage   onNavigate={navigate} showToast={showToast} />}
      {page === "auth"      && <AuthPage       onNavigate={navigate} showToast={showToast} />}
      {page === "dashboard" && <DashboardPage  onNavigate={navigate} showToast={showToast} />}
      <ToastContainer toasts={toasts} />
    </>
  );
};

export default App;
