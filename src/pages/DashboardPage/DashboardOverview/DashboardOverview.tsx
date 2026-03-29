import React, { useState, useEffect, useMemo, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import type { User } from "firebase/auth";
import { useCourseContext } from "../../../context/CourseContext";
import { db } from "../../../firebase/config";
import {
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import {
  subscribeWeeklyAnalytics,
  ensureWeeklyAnalytics,
  formatStudyTime,
  type WeeklyAnalytics,
} from "../../../services/studyTrackingService";
import {
  timeAgo,
  ACTIVITY_META,
  type RecentActivityType,
} from "../../../utils/activityLogger";

// ─── Constants ───────────────────────────────────────────────────────────────

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type DayLabel = (typeof DAY_LABELS)[number];

function getTodayLabel(): DayLabel {
  const keys: DayLabel[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return keys[new Date().getDay()];
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface RecentActivity {
  id: string;
  type: RecentActivityType;
  title: string;
  createdAt: Timestamp | null;
  isNew?: boolean;
}

const performance = [
  { label: "Quizzes", value: 88 },
  { label: "Assignments", value: 76 },
  { label: "Participation", value: 92 },
];

// ─── Component ───────────────────────────────────────────────────────────────

const DashboardOverview = () => {
  const { user } = useOutletContext<{ user: User | null }>();
  const { myCourses, loadingCourses } = useCourseContext();
  const todayLabel = getTodayLabel();

  // ── 1. Recent Activity (real-time) ───────────────────────────────────────
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const prevActivityIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setRecentActivities([]);
      setLoadingRecent(false);
      return;
    }
    setLoadingRecent(true);
    const q = query(
      collection(db, "users", user.uid, "activities"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const incoming: RecentActivity[] = snap.docs.map((d) => ({
          id: d.id,
          type: (d.data().type || "quiz_completed") as RecentActivityType,
          title: typeof d.data().title === "string" ? d.data().title : "Activity",
          createdAt: (d.data().createdAt as Timestamp) || null,
          isNew: !prevActivityIdsRef.current.has(d.id),
        }));
        incoming.forEach((a) => prevActivityIdsRef.current.add(a.id));
        setRecentActivities(incoming);
        setLoadingRecent(false);
        setTimeout(
          () => setRecentActivities((p) => p.map((a) => ({ ...a, isNew: false }))),
          700
        );
      },
      (err) => {
        console.error("Recent activities error:", err);
        setLoadingRecent(false);
      }
    );
    return () => unsub();
  }, [user]);

  // ── 2. Assessment KPI (real-time) ────────────────────────────────────────
  const [assessments, setAssessments] = useState<{ percentage: number }[]>([]);
  const [loadingScores, setLoadingScores] = useState(true);

  useEffect(() => {
    if (!user) { setAssessments([]); setLoadingScores(false); return; }
    setLoadingScores(true);
    const q = query(
      collection(db, "users", user.uid, "assessments"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs
          .map((d) => d.data())
          .filter((d) => typeof d.percentage === "number" && !isNaN(d.percentage));
        setAssessments(data as any);
        setLoadingScores(false);
      },
      (err) => { console.error("Assessments error:", err); setLoadingScores(false); }
    );
    return () => unsub();
  }, [user]);

  const { avgScore, trendChange } = useMemo(() => {
    if (!assessments.length) return { avgScore: 0, trendChange: 0 };
    const avg = Math.round(assessments.reduce((s, a) => s + a.percentage, 0) / assessments.length);
    let trend = 0;
    if (assessments.length >= 2) {
      const prev = assessments.slice(0, -1);
      const prevAvg = Math.round(prev.reduce((s, a) => s + a.percentage, 0) / prev.length);
      trend = avg - prevAvg;
    }
    return { avgScore: avg, trendChange: trend };
  }, [assessments]);

  // ── 3. Weekly Analytics — the single source of truth ────────────────────
  //       Powers BOTH the Study Hours KPI and the Weekly Activity chart.
  //       Written to by saveStudySession() using Firestore increment(),
  //       so data persists across reloads and accumulates correctly.
  const [weeklyData, setWeeklyData] = useState<WeeklyAnalytics | null>(null);
  const [loadingWeekly, setLoadingWeekly] = useState(true);
  const [animateChart, setAnimateChart] = useState(false);
  const prevTotalRef = useRef<number>(-1);

  useEffect(() => {
    if (!user) {
      setWeeklyData(null);
      setLoadingWeekly(false);
      return;
    }

    setLoadingWeekly(true);

    // Ensure the weekly document exists (creates or resets if new week)
    ensureWeeklyAnalytics(user.uid).catch(console.error);

    // Subscribe to real-time updates
    const unsub = subscribeWeeklyAnalytics(
      user.uid,
      (data) => {
        setWeeklyData(data);
        setLoadingWeekly(false);

        // Trigger bar re-animation whenever totalMinutes changes
        if (data.totalMinutes !== prevTotalRef.current) {
          prevTotalRef.current = data.totalMinutes;
          setAnimateChart(false);
          requestAnimationFrame(() => setAnimateChart(true));
        }
      },
      () => setLoadingWeekly(false)
    );

    return () => unsub();
  }, [user]);

  // Chart data derived from the weekly analytics document
  const weeklyChartData = useMemo(
    () =>
      DAY_LABELS.map((label) => ({
        label,
        minutes: weeklyData ? (weeklyData[label] ?? 0) : 0,
        isToday: label === todayLabel,
      })),
    [weeklyData, todayLabel]
  );

  const maxMinutes = useMemo(
    () => Math.max(...weeklyChartData.map((d) => d.minutes), 1),
    [weeklyChartData]
  );

  // Formatted study time for KPI card
  const studyTimeDisplay = useMemo(
    () => (weeklyData ? formatStudyTime(weeklyData.totalMinutes) : "0m"),
    [weeklyData]
  );

  // ── 4. Tooltip state ─────────────────────────────────────────────────────
  const [tooltip, setTooltip] = useState<{
    visible: boolean; x: number; y: number; minutes: number;
  }>({ visible: false, x: 0, y: 0, minutes: 0 });

  // ── 5. Greeting ──────────────────────────────────────────────────────────
  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  })();

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="dash-welcome">
        <h1>{greeting}, {user?.displayName?.split(" ")[0] || "User"} 👋</h1>
        <p>Here&apos;s what&apos;s happening with your learning today.</p>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div className="kpi-grid">
        {/* Courses Enrolled */}
        <div className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Courses Enrolled</span>
            <div className="kpi-card__icon-wrap">📚</div>
          </div>
          <div className="kpi-card__value">
            {!user ? "0" : loadingCourses ? "…" : myCourses.length}
          </div>
          <div className="kpi-card__change up">
            ↑ +{myCourses.length > 0 ? "1" : "0"} this term
          </div>
        </div>

        {/* Avg Score */}
        <div className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Avg Score</span>
            <div className="kpi-card__icon-wrap">📈</div>
          </div>
          <div className="kpi-card__value">
            {!user ? "0%" : loadingScores ? "…" : `${avgScore}%`}
          </div>
          <div className={`kpi-card__change ${assessments.length < 2 ? "neutral" : trendChange >= 0 ? "up" : "down"}`}>
            {assessments.length < 2
              ? assessments.length === 0 ? "No assessments yet" : "Take another to see trend"
              : trendChange >= 0 ? `↑ +${trendChange}% from last` : `↓ ${trendChange}% from last`}
          </div>
        </div>

        {/* Tasks Due */}
        <div className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Tasks Due</span>
            <div className="kpi-card__icon-wrap">✅</div>
          </div>
          <div className="kpi-card__value">3</div>
          <div className="kpi-card__change down">↓ 2 overdue</div>
        </div>

        {/* Study Hours — now reads from analytics/weekly.totalMinutes */}
        <div className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Study Hours</span>
            <div className="kpi-card__icon-wrap">⏱</div>
          </div>
          <div className="kpi-card__value">
            {!user ? "0m" : loadingWeekly ? "…" : studyTimeDisplay}
          </div>
          <div className="kpi-card__change neutral">• this week</div>
        </div>
      </div>

      {/* ── Weekly Activity + Recent Activity ─────────────────────────────── */}
      <div className="dash-row dash-row--2-1">

        {/* Weekly Activity Chart */}
        <div className="dash-widget">
          <div className="dash-widget__header">
            <h3 className="dash-widget__title">Weekly Activity</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {loadingWeekly && (
                <span style={{ fontSize: 11, color: "var(--color-grey-400)", fontFamily: "var(--font-mono)" }}>
                  syncing…
                </span>
              )}
              <span className="dash-widget__action">View report →</span>
            </div>
          </div>
          <div className="dash-widget__body">
            {/* Legend */}
            <div className="wa-legend">
              <span className="wa-legend__dot wa-legend__dot--active" />
              <span className="wa-legend__label">Today</span>
              <span className="wa-legend__dot" />
              <span className="wa-legend__label">Other days</span>
            </div>

            {/* Chart */}
            <div className="wa-chart" style={{ position: "relative" }}>
              {weeklyChartData.map((d, idx) => {
                const heightPct = d.minutes === 0 ? 4 : (d.minutes / maxMinutes) * 85;
                return (
                  <div
                    key={d.label}
                    className="wa-bar-wrap"
                    onMouseEnter={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      const pr = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
                      setTooltip({
                        visible: true,
                        x: r.left - pr.left + r.width / 2,
                        y: r.top - pr.top - 8,
                        minutes: d.minutes,
                      });
                    }}
                    onMouseLeave={() => setTooltip((t) => ({ ...t, visible: false }))}
                  >
                    <div
                      className={`wa-bar${d.isToday ? " wa-bar--today" : ""}${d.minutes === 0 ? " wa-bar--zero" : ""}`}
                      style={{
                        height: animateChart ? `${heightPct}%` : "4%",
                        transitionDelay: `${idx * 60}ms`,
                      }}
                    />
                    <span className={`wa-bar-label${d.isToday ? " wa-bar-label--today" : ""}`}>
                      {d.label}
                    </span>
                  </div>
                );
              })}

              {/* Tooltip */}
              {tooltip.visible && (
                <div
                  className="wa-tooltip"
                  style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
                >
                  {tooltip.minutes > 0 ? `${tooltip.minutes} min studied` : "No activity"}
                </div>
              )}
            </div>

            {/* Empty-state nudge */}
            {!loadingWeekly && (!weeklyData || weeklyData.totalMinutes === 0) && (
              <div className="wa-empty">
                <span>📊</span>
                <p>No activity logged this week yet.</p>
                <p>Start a lesson or take an assessment to track your progress!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dash-widget">
          <div className="dash-widget__header">
            <h3 className="dash-widget__title">Recent Activity</h3>
            {loadingRecent && (
              <span style={{ fontSize: 11, color: "var(--color-grey-400)", fontFamily: "var(--font-mono)" }}>
                syncing…
              </span>
            )}
          </div>
          <div className="dash-widget__body">
            {/* Skeleton */}
            {loadingRecent && recentActivities.length === 0 && (
              <div className="activity-list">
                {[1, 2, 3].map((i) => (
                  <div className="activity-item" key={i}>
                    <div className="activity-dot ra-skeleton-dot" />
                    <div className="activity-item__content">
                      <div className="ra-skeleton ra-skeleton--title" />
                      <div className="ra-skeleton ra-skeleton--time" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loadingRecent && recentActivities.length === 0 && (
              <div className="ra-empty">
                <span>🗒️</span>
                <p>No recent activity yet.</p>
                <p>Complete a quiz, enroll in a course, or watch a video to get started!</p>
              </div>
            )}

            {/* Dynamic list */}
            {recentActivities.length > 0 && (
              <div className="activity-list">
                {recentActivities.map((a) => {
                  const meta = ACTIVITY_META[a.type] ?? { icon: "📌", color: "var(--color-grey-400)" };
                  return (
                    <div className={`activity-item${a.isNew ? " ra-item--new" : ""}`} key={a.id}>
                      <div className="ra-icon" style={{ color: meta.color }}>{meta.icon}</div>
                      <div className="activity-item__content">
                        <div className="activity-item__text">{a.title}</div>
                        <div className="activity-item__time">
                          {a.createdAt ? timeAgo(a.createdAt.toDate()) : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Syllabus Progress ────────────────────────────────────────────── */}

    </>
  );
};

export default DashboardOverview;
