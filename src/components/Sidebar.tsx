import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  return (
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
          <span className="nav-icon">📊</span> Overview
        </NavLink>
        <NavLink
          to="/dashboard/allcourses"
          className={({ isActive }) => `sidebar__nav-item${isActive ? " active" : ""}`}
          onClick={() => setSidebarOpen(false)}
        >
          <span className="nav-icon">📚</span> All Courses
          <span className="nav-badge">6</span>
        </NavLink>
        <button className="sidebar__nav-item">
          <span className="nav-icon">📚</span> My Courses
          <span className="nav-badge">6</span>
        </button>
        <NavLink
          to="/assessments"
          className={({ isActive }) => `sidebar__nav-item${isActive ? " active" : ""}`}
          onClick={() => setSidebarOpen(false)}
        >
          <span className="nav-icon">✅</span> Assessments
        </NavLink>
        <button className="sidebar__nav-item">
          <span className="nav-icon">📈</span> Progress
        </button>

        <p className="sidebar__section-label">System</p>
        <button className="sidebar__nav-item">
          <span className="nav-icon">⚙️</span> Settings
        </button>
      </nav>

      <div className="sidebar__footer">
        <button className="sidebar__nav-item" onClick={() => navigate("/auth")}>
          <span className="nav-icon">📁</span> Logout
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
  );
};

export default Sidebar;
