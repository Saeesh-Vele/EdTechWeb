import React from "react";
import "./DataAnalyst.css";
import roadmap from "../../../../assets/roadmaps/dataanalyst.jpeg";

const DataAnalyst: React.FC = () => {
    return (
        <div className="roadmap-wrapper">
            <h1 className="roadmap-title">Data Analyst Roadmap</h1>

            <div className="roadmap-image-container">
                <img
                    src={roadmap}
                    alt="Data Analyst Roadmap"
                    className="roadmap-image"
                />
            </div>
        </div>
    );
};

export default DataAnalyst;
