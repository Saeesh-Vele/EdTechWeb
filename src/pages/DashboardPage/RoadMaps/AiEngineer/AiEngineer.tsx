import React from "react";
import "./AiEngineer.css";
import roadmap from "../../../../assets/roadmaps/aiengineer.jpeg";

const AIEngineerRoadmap: React.FC = () => {
    return (
        <div className="roadmap-wrapper">
            <h1 className="roadmap-title">AI Engineer Roadmap</h1>

            <div className="roadmap-image-container">
                <img
                    src={roadmap}
                    alt="AI Engineer Roadmap"
                    className="roadmap-image"
                />
            </div>
        </div>
    );
};

export default AIEngineerRoadmap;