import React from "react";
import "./DataEngineer.css";
import roadmap from "../../../../assets/roadmaps/dataengineer.jpeg";
import { useCourseContext } from "../../../../context/CourseContext";

const DataEngineer: React.FC = () => {
    const { addCourse, isCourseAdded } = useCourseContext();
    const added = isCourseAdded("Data Engineer");

    return (
        <div className="roadmap-wrapper">
            <div className="roadmap-header">
                <h1 className="roadmap-title">Data Engineer Roadmap</h1>
                <button
                    onClick={() => addCourse("Data Engineer")}
                    disabled={added}
                    className={`roadmap-add-btn ${added ? "roadmap-add-btn--added" : ""}`}
                >
                    {added ? "Added" : "Add to My Courses"}
                </button>
            </div>

            <div className="roadmap-image-container">
                <img
                    src={roadmap}
                    alt="Data Engineer Roadmap"
                    className="roadmap-image"
                />
            </div>
        </div>
    );
};

export default DataEngineer;
