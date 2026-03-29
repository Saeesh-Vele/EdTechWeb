import React from "react";
import "./DataAnalyst.css";
import roadmap from "../../../../assets/roadmaps/dataanalyst.jpeg";
import { useCourseContext } from "../../../../context/CourseContext";

const DataAnalyst: React.FC = () => {
    const { addCourse, isCourseAdded } = useCourseContext();
    const added = isCourseAdded("Data Analyst");

    return (
        <div className="roadmap-wrapper">
            <div className="roadmap-header">
                <h1 className="roadmap-title">Data Analyst Roadmap</h1>
                <button
                    onClick={() => addCourse("Data Analyst")}
                    disabled={added}
                    className={`roadmap-add-btn ${added ? "roadmap-add-btn--added" : ""}`}
                >
                    {added ? "Added" : "Add to My Courses"}
                </button>
            </div>

            <div className="roadmap-image-container">
                <img
                    src={roadmap}
                    alt="Data Analyst Roadmap"
                    className="roadmap-image"
                />
            </div>
        </div>
    );
};

export default DataAnalyst;
