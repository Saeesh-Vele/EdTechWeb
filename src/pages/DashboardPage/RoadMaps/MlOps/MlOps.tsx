import React from "react";
import "./MlOps.css";
import roadmap from "../../../../assets/roadmaps/mlops.jpeg";
import { useCourseContext } from "../../../../context/CourseContext";

const MLOps: React.FC = () => {
    const { addCourse, isCourseAdded } = useCourseContext();
    const added = isCourseAdded("MlOps");

    return (
        <div className="roadmap-wrapper">
            <div className="roadmap-header">
                <h1 className="roadmap-title">MLOps Roadmap</h1>
                <button
                    onClick={() => addCourse("MlOps")}
                    disabled={added}
                    className={`roadmap-add-btn ${added ? "roadmap-add-btn--added" : ""}`}
                >
                    {added ? "Added" : "Add to My Courses"}
                </button>
            </div>

            <div className="roadmap-image-container">
                <img
                    src={roadmap}
                    alt="MLOps Roadmap"
                    className="roadmap-image"
                />
            </div>
        </div>
    );
};

export default MLOps;
