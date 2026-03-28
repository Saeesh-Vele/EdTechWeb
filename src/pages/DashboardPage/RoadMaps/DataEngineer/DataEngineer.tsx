import React from "react";
import "./DataEngineer.css";
import roadmap from "../../../../assets/roadmaps/dataengineer.jpeg";

const DataEngineer: React.FC = () => {
    return (
        <div className="roadmap-wrapper">
            <h1 className="roadmap-title">Data Engineer Roadmap</h1>

            <div className="roadmap-image-container">
                <img
                    src={roadmap}
                    alt="Data Engineer Roadmap"
                    className="roadmap-image"
                />
            </div>
        </div>
    );
};

export default DataEngineer;
