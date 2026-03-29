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
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen((o) => !o)}
        >
          ☰
        </button>

        <div className="dash-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;