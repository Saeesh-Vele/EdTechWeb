import React from "react";
import "./FullStack.css";
import roadmap from "../../../../assets/roadmaps/fullstack.jpeg";

const FullStackRoadmap: React.FC = () => {
    return (
        <div className="roadmap-wrapper">
            <h1 className="roadmap-title">Full Stack Roadmap</h1>

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

export default FullStackRoadmap;
