import React from "react";
import "./MachineLearning.css";
import roadmap from "../../../../assets/roadmaps/machinelearning.jpeg";
import { useCourseContext } from "../../../../context/CourseContext";

const MachineLearning: React.FC = () => {
    const { addCourse, isCourseAdded } = useCourseContext();
    const added = isCourseAdded("Machine Learning");

    return (
        <div className="roadmap-wrapper">
            <div className="roadmap-header">
                <h1 className="roadmap-title">Machine Learning Roadmap</h1>
                <button
                    onClick={() => addCourse("Machine Learning")}
                    disabled={added}
                    className={`roadmap-add-btn ${added ? "roadmap-add-btn--added" : ""}`}
                >
                    {added ? "Added" : "Add to My Courses"}
                </button>
            </div>

            <div className="roadmap-image-container">
                <img
                    src={roadmap}
                    alt="Machine Learning Roadmap"
                    className="roadmap-image"
                />
            </div>
        </div>
    );
};

export default MachineLearning;
