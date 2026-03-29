import React from "react";
import type { TopicPerformance } from "./TopicCard";

interface WeakTopicsListProps {
  topics: TopicPerformance[];
}

const WeakTopicsList: React.FC<WeakTopicsListProps> = ({ topics }) => {
  // Sort ascending by accuracy (weakest first)
  const sorted = [...topics]
    .filter((t) => t.accuracy < 50)
    .sort((a, b) => a.accuracy - b.accuracy);

  if (sorted.length === 0) {
    return (
      <div style={{ padding: "20px 0", textAlign: "center", color: "var(--color-grey-400)", fontSize: 13 }}>
        🎉 No weak topics — keep up the great work!
      </div>
    );
  }

  return (
    <div className="hs-weak-list">
      {sorted.map((topic, idx) => (
        <div className="hs-weak-item" key={topic.id}>
          <div className="hs-weak-item__rank">{idx + 1}</div>
          <div className="hs-weak-item__info">
            <div className="hs-weak-item__name">{topic.topicName}</div>
            {topic.domain && (
              <div className="hs-weak-item__domain">{topic.domain}</div>
            )}
          </div>
          <div className="hs-weak-item__stats">
            <div className="hs-weak-item__stat">
              <div className="hs-weak-item__stat-value">
                {Math.round(topic.accuracy)}%
              </div>
              <div className="hs-weak-item__stat-label">Accuracy</div>
            </div>
            <div className="hs-weak-item__stat">
              <div className="hs-weak-item__stat-value" style={{ color: "var(--color-grey-200)" }}>
                {topic.total}
              </div>
              <div className="hs-weak-item__stat-label">Attempts</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeakTopicsList;
