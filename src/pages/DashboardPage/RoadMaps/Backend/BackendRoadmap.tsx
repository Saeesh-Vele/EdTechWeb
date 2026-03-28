import React from "react";
import "./BackendRoadmap.css"; // reuse same CSS
import roadmap from "../../../../assets/roadmaps/backend.jpeg";

const BackendRoadmap = () => {
    return (
        <div className="roadmap-wrapper">
            <h1 className="roadmap-title">Backend Roadmap</h1>

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