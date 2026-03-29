import React from "react";
import "./FullStack.css";
import roadmap from "../../../../assets/roadmaps/fullstack.jpeg";
import { useCourseContext } from "../../../../context/CourseContext";

const FullStackRoadmap: React.FC = () => {
    const { addCourse, isCourseAdded } = useCourseContext();
    const added = isCourseAdded("Full Stack");

    return (
        <div className="roadmap-wrapper">
            <div className="roadmap-header">
                <h1 className="roadmap-title">Full Stack Roadmap</h1>
                <button
                    onClick={() => addCourse("Full Stack")}
                    disabled={added}
                    className={`roadmap-add-btn ${added ? "roadmap-add-btn--added" : ""}`}
                >
                    {added ? "Added" : "Add to My Courses"}
                </button>
            </div>

            <div className="roadmap-image-container">
                <img
                    src={roadmap}
                    alt="Full Stack Roadmap"
                    className="roadmap-image"
                />
            </div>
        </div>
    );
};

export default FullStackRoadmap;
