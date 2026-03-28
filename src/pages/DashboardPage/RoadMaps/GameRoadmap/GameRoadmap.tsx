import React from "react";
import "./GameRoadmap.css";
import roadmap from "../../../../assets/roadmaps/game-dev.jpeg";

const GameRoadmap = () => {
    return (
        <div className="roadmap-wrapper">
            <h1 className="roadmap-title">Game Developer Roadmap</h1>

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