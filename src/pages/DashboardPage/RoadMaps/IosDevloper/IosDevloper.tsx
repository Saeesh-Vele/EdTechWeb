import React from "react";
import "./IosDevloper.css";
import roadmap from "../../../../assets/roadmaps/iosdevloper.jpeg";

const IosDevloper: React.FC = () => {
    return (
        <div className="roadmap-wrapper">
            <h1 className="roadmap-title">iOS Developer Roadmap</h1>

            <div className="roadmap-image-container">
                <img
                    src={roadmap}
                    alt="iOS Developer Roadmap"
                    className="roadmap-image"
                />
            </div>
        </div>
    );
};

export default IosDevloper;
