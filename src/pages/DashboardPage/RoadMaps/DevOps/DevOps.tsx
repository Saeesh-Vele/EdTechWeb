import React from "react";
import "./DevOps.css";
import roadmap from "../../../../assets/roadmaps/devops.jpeg";

const DevOps: React.FC = () => {
    return (
        <div className="roadmap-wrapper">
            <h1 className="roadmap-title">DevOps Roadmap</h1>

            <div className="roadmap-image-container">
                <img
                    src={roadmap}
                    alt="Full Stack Roadmap"
                    className="roadmap-image"
                />
            </div>
        </div>
    );
};

export default DevOps;
