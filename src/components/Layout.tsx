import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-page">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dash-topbar">
          <div className="dash-topbar__left">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen((o) => !o)}
            >
              ☰
            </button>
            <h2 className="dash-topbar__title">Overview</h2>
          </div>

          <div className="dash-topbar__search">
            <span className="dash-topbar__search-icon">🔍</span>
            <input type="text" placeholder="Search courses, students..." />
          </div>

          <div className="dash-topbar__actions">
            <button className="icon-btn">
              🔔 <span className="badge">2</span>
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

export default Layout;