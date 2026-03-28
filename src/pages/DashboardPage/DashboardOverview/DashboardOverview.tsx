import React from "react";
import type { ChartDataItem } from "../../../types";

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

const DashboardOverview = () => {
  return (
    <>
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
    </>
  );
};

export default DashboardOverview;
