import React from "react";
import "./DevOps.css";
import roadmap from "../../../../assets/roadmaps/devops.jpeg";
import { useCourseContext } from "../../../../context/CourseContext";

const DevOps: React.FC = () => {
    const { addCourse, isCourseAdded } = useCourseContext();
    const added = isCourseAdded("DevOps");

    return (
        <div className="roadmap-wrapper">
            <div className="roadmap-header">
                <h1 className="roadmap-title">DevOps Roadmap</h1>
                <button
                    onClick={() => addCourse("DevOps")}
                    disabled={added}
                    className={`roadmap-add-btn ${added ? "roadmap-add-btn--added" : ""}`}
                >
                    {added ? "Added" : "Add to My Courses"}
                </button>
            </div>

            <div className="roadmap-image-container">
                <img
                    src={roadmap}
                    alt="DevOps Roadmap"
                    className="roadmap-image"
                />
            </div>
        </div>
    );
};

export default DevOps;
