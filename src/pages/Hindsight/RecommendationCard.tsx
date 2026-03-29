import React from "react";
import { useNavigate } from "react-router-dom";
import type { TopicPerformance } from "./TopicCard";

interface Recommendation {
  icon: string;
  title: string;
  description: string;
  cta: string;
  action: () => void;
}

interface RecommendationCardProps {
  topic: TopicPerformance;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ topic }) => {
  const navigate = useNavigate();

  const recommendations: Recommendation[] = [
    {
      icon: "🔁",
      title: "Practice Again",
      description: `Retake a quiz on "${topic.topicName}" to improve your accuracy from ${Math.round(topic.accuracy)}%.`,
      cta: "Go to Assessments →",
      action: () => navigate("/dashboard/assessments"),
    },
    {
      icon: "📖",
      title: "Review Content",
      description: `Revisit the learning material for "${topic.topicName}" to strengthen your understanding.`,
      cta: "Start Revision →",
      action: () => navigate("/dashboard/revision", { state: { topics: [topic.topicName] } }),
    },
    {
      icon: "🎯",
      title: "Try Similar Questions",
      description: `Practice related concepts in ${topic.domain || "this domain"} to build connected knowledge.`,
      cta: "Explore Courses →",
      action: () => navigate("/dashboard/allcourses"),
    },
  ];

  return (
    <>
      {recommendations.map((rec) => (
        <div
          className="hs-rec-card"
          key={rec.title}
          onClick={rec.action}
        >
          <div className="hs-rec-card__icon">{rec.icon}</div>
          <div className="hs-rec-card__topic">{topic.topicName}</div>
          <div className="hs-rec-card__title">{rec.title}</div>
          <div className="hs-rec-card__desc">{rec.description}</div>
          <div className="hs-rec-card__cta">{rec.cta}</div>
        </div>
      ))}
    </>
  );
};

export default RecommendationCard;
