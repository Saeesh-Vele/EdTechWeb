import React from "react";
import "./IosDevloper.css";
import roadmap from "../../../../assets/roadmaps/iosdevloper.jpeg";
import { useCourseContext } from "../../../../context/CourseContext";

const IosDevloper: React.FC = () => {
    const { addCourse, isCourseAdded } = useCourseContext();
    const added = isCourseAdded("iOS");

    return (
        <div className="roadmap-wrapper">
            <div className="roadmap-header">
                <h1 className="roadmap-title">iOS Developer Roadmap</h1>
                <button
                    onClick={() => addCourse("iOS")}
                    disabled={added}
                    className={`roadmap-add-btn ${added ? "roadmap-add-btn--added" : ""}`}
                >
                    {added ? "Added" : "Add to My Courses"}
                </button>
            </div>

            <div className="roadmap-image-container">
                <img
                    src={roadmap}
                    alt="iOS Developer Roadmap"
                    className="roadmap-image"
                />
            </div>
        </div>
    );
};

export default IosDevloper;
