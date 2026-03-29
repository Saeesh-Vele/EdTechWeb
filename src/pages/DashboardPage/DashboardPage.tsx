import React, { useState, type FC } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          <button className="sidebar__nav-item" onClick={() => navigate("/auth")}>
            <span className="nav-icon"><FiLogOut /></span> Logout
          </button>
          <div className="sidebar__user">
            <div className="user-avatar">R</div>
            <div className="user-info">
              <div className="user-info__name">Ravi Kumar</div>
              <div className="user-info__role">Student</div>
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
            <div className="user-avatar" style={{ width: 32, height: 32 }}><span>R</span></div>
          </div>
        </header>

        <div className="dash-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
