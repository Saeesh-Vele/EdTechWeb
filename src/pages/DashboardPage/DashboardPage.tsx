import React, { useState, type FC } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { signOut, type User } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import {
  FiHome,
  FiLayers,
  FiBookOpen,
  FiCheckSquare,
  FiTrendingUp,
  FiSettings,
  FiLogOut,
  FiBell,
  FiSearch,
  FiMenu,
} from "react-icons/fi";

import type { ToastType } from "../../types";
import "./DashboardPage.css";

interface DashboardPageProps {
  showToast: (msg: string, type?: ToastType) => void;
}

const DashboardPage: FC<DashboardPageProps> = ({ showToast }) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Wait for Firebase Auth to resolve before rendering anything
  if (authLoading) {
    return (
      <div className="dashboard-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0a' }}>
        <div style={{ textAlign: 'center' }}>
          <svg className="animate-spin" style={{ width: 32, height: 32, margin: '0 auto 12px', color: '#fff' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p style={{ color: '#888', fontSize: 14 }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/auth");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const displayName = user?.displayName || user?.email || "User";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sidebar__header">
          <button
            className="nav__logo"
            onClick={() => navigate("/")}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <div className="nav__logo-icon"><span>S</span></div>
            Smart EdTech
          </button>
        </div>

        <nav className="sidebar__nav">
          <p className="sidebar__section-label">Main</p>
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) => `sidebar__nav-item${isActive ? " active" : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="nav-icon"><FiHome /></span> Overview
          </NavLink>
          <NavLink
            to="/dashboard/allcourses"
            className={({ isActive }) => `sidebar__nav-item${isActive ? " active" : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="nav-icon"><FiLayers /></span> All Courses
          </NavLink>

          <p className="sidebar__section-label mt-4">My Courses</p>
          <NavLink
            to="/dashboard/my-courses"
            className={({ isActive }) => `sidebar__nav-item${isActive ? " active" : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="nav-icon"><FiBookOpen /></span> My Courses
          </NavLink>
          <NavLink
            to="/dashboard/assessments"
            className={({ isActive }) => `sidebar__nav-item${isActive ? " active" : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="nav-icon"><FiCheckSquare /></span> Assessments
          </NavLink>
          <button className="sidebar__nav-item">
            <span className="nav-icon"><FiTrendingUp /></span> Progress
          </button>

          <p className="sidebar__section-label">System</p>
          <button className="sidebar__nav-item">
            <span className="nav-icon"><FiSettings /></span> Settings
          </button>
        </nav>

        <div className="sidebar__footer">
          <button className="sidebar__nav-item" onClick={handleLogout}>
            <span className="nav-icon"><FiLogOut /></span> Logout
          </button>
          <div className="sidebar__user group relative">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="profile" className="w-[40px] h-[40px] rounded-full object-cover border border-[#333]" />
            ) : (
              <div className="user-avatar">{user?.displayName?.[0]?.toUpperCase() || "U"}</div>
            )}
            <div className="user-info">
              <div className="user-info__name truncate w-[100px]">{user?.displayName || "Loading..."}</div>
              <div className="user-info__role">Student</div>
            </div>

            {/* Tooltip */}
            <div className="absolute left-0 -top-12 bg-black text-white px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-[#333] shadow-xl">
              {user?.displayName || "User"} <br />
              <span className="text-gray-400">{user?.email || "No email"}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dash-topbar">
          <div className="dash-topbar__left">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen((o) => !o)}
            >
              <FiMenu />
            </button>
            <h2 className="dash-topbar__title">Overview</h2>
          </div>

          <div className="dash-topbar__search">
            <span className="dash-topbar__search-icon"><FiSearch /></span>
            <input type="text" placeholder="Search courses, students..." />
          </div>

          <div className="dash-topbar__actions">
            <button className="icon-btn">
              <FiBell /> <span className="badge">2</span>
            </button>

            <div className="relative group cursor-pointer">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="profile" className="w-8 h-8 rounded-full object-cover border border-[#333]" />
              ) : (
                <div className="user-avatar flex items-center justify-center font-bold" style={{ width: 32, height: 32 }}><span>{user?.displayName?.[0]?.toUpperCase() || "U"}</span></div>
              )}

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#111] border border-[#333] rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                <div className="p-3 border-b border-[#333]">
                  <p className="text-white text-sm font-semibold truncate leading-tight">{user?.displayName || "User"}</p>
                  <p className="text-gray-400 text-xs truncate mt-0.5">{user?.email || ""}</p>
                </div>
                <div className="p-1.5">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2">
                    <span>⚙️</span> Settings
                  </button>
                  <button onClick={() => navigate("/auth")} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2">
                    <span>🚪</span> Logout
                  </button>
                </div>
              </div>
            </div>

          </div>
        </header>

        <div className="dash-content">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
