import React from "react";
import "./GameRoadmap.css";
import roadmap from "../../../../assets/roadmaps/game-dev.jpeg";
import { useCourseContext } from "../../../../context/CourseContext";

const GameRoadmap = () => {
    const { addCourse, isCourseAdded } = useCourseContext();
    const added = isCourseAdded("GameDevelopment");

    return (
        <div className="roadmap-wrapper">
            <div className="roadmap-header">
                <h1 className="roadmap-title">Game Developer Roadmap</h1>
                <button
                    onClick={() => addCourse("GameDevelopment")}
                    disabled={added}
                    className={`roadmap-add-btn ${added ? "roadmap-add-btn--added" : ""}`}
                >
                    {added ? "Added" : "Add to My Courses"}
                </button>
            </div>

            <div className="roadmap-image-container">
                <img
                    src={roadmap}
                    alt="Game Developer Roadmap"
                    className="roadmap-image"
                />
            </div>
        </div>
    );
};

export default GameRoadmap;