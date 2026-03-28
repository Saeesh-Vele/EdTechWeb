import React from "react";
import "./MachineLearning.css";
import roadmap from "../../../../assets/roadmaps/machinelearning.jpeg";

const MachineLearning: React.FC = () => {
    return (
        <div className="roadmap-wrapper">
            <h1 className="roadmap-title">Machine Learning Roadmap</h1>

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
