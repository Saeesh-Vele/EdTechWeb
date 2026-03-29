import React from "react";
import "./BackendRoadmap.css"; // reuse same CSS
import roadmap from "../../../../assets/roadmaps/backend.jpeg";
import { useCourseContext } from "../../../../context/CourseContext";

const BackendRoadmap = () => {
    const { addCourse, isCourseAdded } = useCourseContext();
    const added = isCourseAdded("Backend");

    return (
        <div className="roadmap-wrapper">
            <div className="roadmap-header">
                <h1 className="roadmap-title">Backend Roadmap</h1>
                <button
                    onClick={() => addCourse("Backend")}
                    disabled={added}
                    className={`roadmap-add-btn ${added ? "roadmap-add-btn--added" : ""}`}
                >
                    {added ? "Added" : "Add to My Courses"}
                </button>
            </div>

            <div className="roadmap-image-container">
                <img
                    src={roadmap}
                    alt="Backend Roadmap"
                    className="roadmap-image"
                />
            </div>
        </div>
    );
};

export default BackendRoadmap;