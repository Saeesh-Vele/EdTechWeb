import React from "react";
import "./BlockChain.css";
import roadmap from "../../../../assets/roadmaps/blockchain.jpeg";
import { useCourseContext } from "../../../../context/CourseContext";

const BlockChain: React.FC = () => {
    const { addCourse, isCourseAdded } = useCourseContext();
    const added = isCourseAdded("Blockchain");

    return (
        <div className="roadmap-wrapper">
            <div className="roadmap-header">
                <h1 className="roadmap-title">BlockChain Roadmap</h1>
                <button
                    onClick={() => addCourse("Blockchain")}
                    disabled={added}
                    className={`roadmap-add-btn ${added ? "roadmap-add-btn--added" : ""}`}
                >
                    {added ? "Added" : "Add to My Courses"}
                </button>
            </div>

            <div className="roadmap-image-container">
                <img
                    src={roadmap}
                    alt="Blockchain Roadmap"
                    className="roadmap-image"
                />
            </div>
        </div>
    );
};

export default BlockChain;
