import React from "react";
import "./AndroidRoadmap.css";
import roadmap from "../../../../assets/roadmaps/Android.jpeg";

const AndroidRoadmap = () => {
    return (
        <div className="roadmap-wrapper">
            <h1 className="roadmap-title">Android Roadmap</h1>

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