import React, { useState, useEffect, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import type { User } from "firebase/auth";
import { db } from "../../firebase/config";
import { onSnapshot, collection } from "firebase/firestore";

import TopicCard, { getStrengthFromAccuracy, type TopicPerformance } from "./TopicCard";
import WeakTopicsList from "./WeakTopicsList";
import RecommendationCard from "./RecommendationCard";
import "./HindsightPage.css";

const HindsightPage: React.FC = () => {
  const { user } = useOutletContext<{ user: User | null }>();
  const navigate = useNavigate();

  const [topics, setTopics] = useState<TopicPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Real-time Firestore subscription ──────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setTopics([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const colRef = collection(db, "users", user.uid, "topicPerformance");

    const unsub = onSnapshot(
      colRef,
      (snap) => {
        const data: TopicPerformance[] = snap.docs.map((doc) => {
          const d = doc.data();
          const correct = typeof d.correct === "number" ? d.correct : 0;
          const wrong = typeof d.wrong === "number" ? d.wrong : 0;
          const total = typeof d.total === "number" ? d.total : 0;
          const accuracy = total > 0 ? (correct / total) * 100 : 0;

          return {
            id: doc.id,
            topicName: d.topicName || doc.id,
            correct,
            wrong,
            total,
            accuracy,
            strength: getStrengthFromAccuracy(accuracy),
            domain: d.domain || undefined,
            lastAttemptAt: d.lastAttemptAt || null,
          };
        });

        setTopics(data);
        setLoading(false);
      },
      (err) => {
        console.error("Hindsight: Error fetching topic performance:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  // ── Computed values ───────────────────────────────────────────────────────
  const weakTopics = useMemo(
    () => topics.filter((t) => t.accuracy < 50).sort((a, b) => a.accuracy - b.accuracy),
    [topics]
  );

  const strongTopics = useMemo(
    () => topics.filter((t) => t.accuracy > 75),
    [topics]
  );

  const averageTopics = useMemo(
    () => topics.filter((t) => t.accuracy >= 50 && t.accuracy <= 75),
    [topics]
  );

  const overallAccuracy = useMemo(() => {
    if (topics.length === 0) return 0;
    const totalCorrect = topics.reduce((sum, t) => sum + t.correct, 0);
    const totalAttempts = topics.reduce((sum, t) => sum + t.total, 0);
    return totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  }, [topics]);

  // The single weakest topic for recommendations
  const weakestTopic = weakTopics.length > 0 ? weakTopics[0] : null;

  // ── Empty State ───────────────────────────────────────────────────────────
  if (!loading && topics.length === 0) {
    return (
      <div className="hindsight-page">
        <div className="hindsight-page__header">
          <h1 className="hindsight-page__title">Hindsight 🧠</h1>
          <p className="hindsight-page__subtitle">
            Understand your strengths, find your gaps, and learn smarter.
          </p>
        </div>
        <div className="hs-empty">
          <div className="hs-empty__icon">📊</div>
          <h2 className="hs-empty__title">No insights yet</h2>
          <p className="hs-empty__desc">
            Take an assessment to start tracking your topic performance.
            Hindsight will analyze your results and show you exactly where to focus.
          </p>
          <button
            className="hs-empty__btn"
            onClick={() => navigate("/dashboard/assessments")}
          >
            Take an Assessment →
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="hindsight-page">
        <div className="hindsight-page__header">
          <h1 className="hindsight-page__title">Hindsight 🧠</h1>
          <p className="hindsight-page__subtitle">Loading your insights…</p>
        </div>
        <div className="hs-kpi-row">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="hs-kpi">
              <div className="hs-skeleton" style={{ height: 12, width: "60%", marginBottom: 12 }} />
              <div className="hs-skeleton" style={{ height: 28, width: "40%" }} />
            </div>
          ))}
        </div>
        <div className="hs-topics-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="hs-skeleton--card hs-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  // ── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="hindsight-page">
      {/* Header */}
      <div className="hindsight-page__header">
        <h1 className="hindsight-page__title">Hindsight 🧠</h1>
        <p className="hindsight-page__subtitle">
          Understand your strengths, find your gaps, and learn smarter.
        </p>
      </div>

      {/* KPI Summary */}
      <div className="hs-kpi-row">
        <div className="hs-kpi">
          <div className="hs-kpi__label">Overall Accuracy</div>
          <div className="hs-kpi__value">{overallAccuracy}%</div>
        </div>
        <div className="hs-kpi">
          <div className="hs-kpi__label">Topics Tracked</div>
          <div className="hs-kpi__value">{topics.length}</div>
        </div>
        <div className="hs-kpi">
          <div className="hs-kpi__label">Weak Topics</div>
          <div className={`hs-kpi__value ${weakTopics.length > 0 ? "hs-kpi__value--red" : "hs-kpi__value--green"}`}>
            {weakTopics.length}
          </div>
        </div>
        <div className="hs-kpi">
          <div className="hs-kpi__label">Strong Topics</div>
          <div className="hs-kpi__value hs-kpi__value--green">{strongTopics.length}</div>
        </div>
      </div>

      {/* Section 1: Weak Topics */}
      <div className="hs-section">
        <div className="hs-section__header">
          <div className="hs-section__icon hs-section__icon--red">🧠</div>
          <h2 className="hs-section__title">Weak Topics</h2>
        </div>
        <WeakTopicsList topics={topics} />
      </div>

      {/* Section 2: Topic Performance Overview */}
      <div className="hs-section">
        <div className="hs-section__header">
          <div className="hs-section__icon hs-section__icon--blue">📊</div>
          <h2 className="hs-section__title">Topic Performance Overview</h2>
        </div>
        <div className="hs-topics-grid">
          {topics
            .sort((a, b) => a.accuracy - b.accuracy)
            .map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
        </div>
      </div>

      {/* Section 3: Recommendations */}
      {weakestTopic && (
        <div className="hs-section">
          <div className="hs-section__header">
            <div className="hs-section__icon hs-section__icon--green">🎯</div>
            <h2 className="hs-section__title">Recommendations</h2>
          </div>
          <div className="hs-recs-grid">
            <RecommendationCard topic={weakestTopic} />
          </div>
        </div>
      )}

      {/* Section 4: Improvement Insights */}
      {topics.length > 0 && (
        <div className="hs-section">
          <div className="hs-section__header">
            <div className="hs-section__icon hs-section__icon--amber">📈</div>
            <h2 className="hs-section__title">Improvement Insights</h2>
          </div>
          <div className="hs-insights-grid">
            {topics.map((topic) => {
              const isImproving = topic.accuracy >= 50;
              return (
                <div className="hs-insight-card" key={topic.id}>
                  <div className="hs-insight-card__emoji">
                    {isImproving ? "📈" : "⚠️"}
                  </div>
                  <div className="hs-insight-card__body">
                    <div className="hs-insight-card__topic">{topic.topicName}</div>
                    <div
                      className={`hs-insight-card__label ${
                        isImproving
                          ? "hs-insight-card__label--improving"
                          : "hs-insight-card__label--needs-work"
                      }`}
                    >
                      {isImproving ? "On Track" : "Needs Attention"}
                    </div>
                    <div className="hs-insight-card__detail">
                      {topic.correct}/{topic.total} correct · {Math.round(topic.accuracy)}% accuracy
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HindsightPage;
