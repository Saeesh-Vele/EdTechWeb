import React from "react";
import "./AndroidRoadmap.css";
import roadmap from "../../../../assets/roadmaps/Android.jpeg";
import { useCourseContext } from "../../../../context/CourseContext";

const AndroidRoadmap = () => {
    const { addCourse, isCourseAdded } = useCourseContext();
    const added = isCourseAdded("Android");

    return (
        <div className="roadmap-wrapper">
            <div className="roadmap-header">
                <h1 className="roadmap-title">Android Roadmap</h1>
                <button
                    onClick={() => addCourse("Android")}
                    disabled={added}
                    className={`roadmap-add-btn ${added ? "roadmap-add-btn--added" : ""}`}
                >
                    {added ? "Added" : "Add to My Courses"}
                </button>
            </div>

            <div className="roadmap-image-container">
                <img
                    src={roadmap}
                    alt="Android Roadmap"
                    className="roadmap-image"
                />
            </div>
        </div>
    );
};

export default AndroidRoadmap;