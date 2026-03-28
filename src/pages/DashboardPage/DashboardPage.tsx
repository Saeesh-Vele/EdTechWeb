import React, { useState, type FC } from "react";
import type { Page, ToastType, ChartDataItem } from "../../types";
import "./DashboardPage.css";

interface DashboardPageProps {
  onNavigate: (page: Page) => void;
  showToast: (msg: string, type?: ToastType) => void;
}

const chartData: ChartDataItem[] = [
  { label: "Mon", value: 30 },
  { label: "Tue", value: 45 },
  { label: "Wed", value: 38 },
  { label: "Thu", value: 55 },
  { label: "Fri", value: 80, active: true },
  { label: "Sat", value: 42 },
  { label: "Sun", value: 25 },
];

const activities = [
  { text: "Completed Quiz 3 in Mathematics", time: "2 hours ago", active: true },
  { text: "Submitted assignment for Physics Lab", time: "Yesterday, 4:30 PM" },
  { text: "Enrolled in Data Structures", time: "2 days ago" },
  { text: "Received feedback on Essay 2", time: "3 days ago" },
];

const performance = [
  { label: "Quizzes", value: 88 },
  { label: "Assignments", value: 76 },
  { label: "Participation", value: 92 },
];

const DashboardPage: FC<DashboardPageProps> = ({ onNavigate, showToast }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setTab] = useState("overview");

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sidebar__header">
          <button
            className="nav__logo"
            onClick={() => onNavigate("landing")}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <div className="nav__logo-icon"><span>S</span></div>
            Smart EdTech
          </button>
        </div>

        <nav className="sidebar__nav">
          <p className="sidebar__section-label">Main</p>
          <button
            className={`sidebar__nav-item${activeTab === "overview" ? " active" : ""}`}
            onClick={() => setTab("overview")}
          >
            <span className="nav-icon">📊</span> Overview
          </button>
          <button className="sidebar__nav-item">
            <span className="nav-icon">📚</span> My Courses
            <span className="nav-badge">6</span>
          </button>
          <button className="sidebar__nav-item">
            <span className="nav-icon">✅</span> Assessments
          </button>
          <button className="sidebar__nav-item">
            <span className="nav-icon">📈</span> Progress
          </button>

          <p className="sidebar__section-label">Management</p>
          <button className="sidebar__nav-item">
            <span className="nav-icon">👥</span> Students
          </button>
          <button className="sidebar__nav-item">
            <span className="nav-icon">📄</span> Reports
          </button>
          <button className="sidebar__nav-item">
            <span className="nav-icon">💬</span> Messages
            <span className="nav-badge">3</span>
          </button>

          <p className="sidebar__section-label">System</p>
          <button className="sidebar__nav-item">
            <span className="nav-icon">⚙️</span> Settings
          </button>
        </nav>

        <div className="sidebar__footer">
          <button className="sidebar__nav-item" onClick={() => onNavigate("auth")}>
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
          <div className="dash-welcome">
            <h1>Good morning, Ravi 👋</h1>
            <p>Here's what's happening with your learning today.</p>
          </div>

          {/* KPI */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-card__header">
                <span className="kpi-card__label">Courses Enrolled</span>
                <div className="kpi-card__icon-wrap">📚</div>
              </div>
              <div className="kpi-card__value">6</div>
              <div className="kpi-card__change up">↑ +2 this term</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card__header">
                <span className="kpi-card__label">Avg Score</span>
                <div className="kpi-card__icon-wrap">📈</div>
              </div>
              <div className="kpi-card__value">84%</div>
              <div className="kpi-card__change up">↑ +5% from last</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card__header">
                <span className="kpi-card__label">Tasks Due</span>
                <div className="kpi-card__icon-wrap">✅</div>
              </div>
              <div className="kpi-card__value">3</div>
              <div className="kpi-card__change down">↓ 2 overdue</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card__header">
                <span className="kpi-card__label">Study Hours</span>
                <div className="kpi-card__icon-wrap">⏱</div>
              </div>
              <div className="kpi-card__value">42h</div>
              <div className="kpi-card__change neutral">• This week</div>
            </div>
          </div>

          <div className="dash-row dash-row--2-1">
            {/* Chart */}
            <div className="dash-widget">
              <div className="dash-widget__header">
                <h3 className="dash-widget__title">Weekly Activity</h3>
                <span className="dash-widget__action">View report →</span>
              </div>
              <div className="dash-widget__body">
                <div className="chart-placeholder">
                  {chartData.map((d) => (
                    <div className="chart-bar-wrap" key={d.label}>
                      <div
                        className={`chart-bar${d.active ? " active" : ""}`}
                        style={{ height: `${d.value}%` }}
                      ></div>
                      <span className="chart-bar-label">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="dash-widget">
              <div className="dash-widget__header">
                <h3 className="dash-widget__title">Recent Activity</h3>
                <span className="dash-widget__action">See all</span>
              </div>
              <div className="dash-widget__body">
                <div className="activity-list">
                  {activities.map((a, i) => (
                    <div className="activity-item" key={i}>
                      <div className={`activity-dot${a.active ? " active" : ""}`} />
                      <div className="activity-item__content">
                        <div className="activity-item__text">{a.text}</div>
                        <div className="activity-item__time">{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="dash-row dash-row--full">
            <div className="dash-widget">
              <div className="dash-widget__header">
                <h3 className="dash-widget__title">Syllabus Progress</h3>
              </div>
              <div className="dash-widget__body">
                <div className="donut-stats">
                  {performance.map((p) => (
                    <div className="donut-stat-item" key={p.label}>
                      <span className="donut-stat-item__label">{p.label}</span>
                      <div className="donut-stat-item__bar">
                        <div
                          className="donut-stat-item__fill"
                          style={{ width: `${p.value}%` }}
                        />
                      </div>
                      <span className="donut-stat-item__value">{p.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
