import React from "react";
import "./AiEngineer.css";
import roadmap from "../../../../assets/roadmaps/aiengineer.jpeg";
import { useCourseContext } from "../../../../context/CourseContext";

const AIEngineerRoadmap: React.FC = () => {
    const { addCourse, isCourseAdded } = useCourseContext();
    const added = isCourseAdded("AI Engineer");

    return (
        <div className="roadmap-wrapper">
            <div className="roadmap-header">
                <h1 className="roadmap-title">AI Engineer Roadmap</h1>
                <button
                    onClick={() => addCourse("AI Engineer")}
                    disabled={added}
                    className={`roadmap-add-btn ${added ? "roadmap-add-btn--added" : ""}`}
                >
                    {added ? "Added" : "Add to My Courses"}
                </button>
            </div>

            <div className="roadmap-image-container">
                <img
                    src={roadmap}
                    alt="AI Engineer Roadmap"
                    className="roadmap-image"
                />
            </div>
        </div>
    );
};

export default AIEngineerRoadmap;