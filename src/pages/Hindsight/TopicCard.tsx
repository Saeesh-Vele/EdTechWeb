import React, { useState, useEffect } from "react";

export interface TopicPerformance {
  id: string;
  topicName: string;
  correct: number;
  wrong: number;
  total: number;
  accuracy: number;
  strength: "weak" | "average" | "strong";
  domain?: string;
  lastAttemptAt?: any;
}

function getStrengthFromAccuracy(accuracy: number): "weak" | "average" | "strong" {
  if (accuracy < 50) return "weak";
  if (accuracy <= 75) return "average";
  return "strong";
}

interface TopicCardProps {
  topic: TopicPerformance;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic }) => {
  const [animateBar, setAnimateBar] = useState(false);
  const strength = getStrengthFromAccuracy(topic.accuracy);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateBar(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="hs-topic-card">
      <div className="hs-topic-card__top">
        <span className="hs-topic-card__name">{topic.topicName}</span>
        <span className={`hs-topic-card__accuracy hs-topic-card__accuracy--${strength}`}>
          {Math.round(topic.accuracy)}%
        </span>
      </div>

      <div className="hs-topic-card__bar">
        <div
          className={`hs-topic-card__bar-fill hs-topic-card__bar-fill--${strength}`}
          style={{ width: animateBar ? `${Math.round(topic.accuracy)}%` : "0%" }}
        />
      </div>

      <div className="hs-topic-card__meta">
        <span className={`hs-topic-card__badge hs-topic-card__badge--${strength}`}>
          {strength}
        </span>
        <span>{topic.total} attempts</span>
        <span>{topic.correct} correct</span>
        {topic.domain && <span>{topic.domain}</span>}
      </div>
    </div>
  );
};

export { getStrengthFromAccuracy };
export default TopicCard;
