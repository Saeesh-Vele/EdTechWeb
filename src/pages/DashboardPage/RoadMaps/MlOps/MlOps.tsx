import React from "react";
import "./MlOps.css";
import roadmap from "../../../../assets/roadmaps/mlops.jpeg";

const MLOps: React.FC = () => {
    return (
        <div className="roadmap-wrapper">
            <h1 className="roadmap-title">MLOps Roadmap</h1>

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
