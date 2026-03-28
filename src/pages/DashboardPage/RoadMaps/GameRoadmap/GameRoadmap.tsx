import React from "react";
import "./GameRoadmap.css";

const sections = [
    {
        title: "Game Mathematics",
        items: ["Linear Algebra", "Vector", "Matrix", "Geometry"]
    },
    {
        title: "Game Engine",
        items: ["Unity", "Unreal", "Godot", "Native"]
    },
    {
        title: "Programming",
        items: ["C++", "C#", "Rust", "Python"]
    },
    {
        title: "Computer Graphics",
        items: ["Ray Tracing", "Shaders", "Rendering", "Textures"]
    },
    {
        title: "Game Physics",
        items: ["Collision", "Forces", "Dynamics", "Friction"]
    },
    {
        title: "Game AI",
        items: ["Decision Trees", "Behavior Trees", "ML", "RL"]
    }
];

const GameRoadmap = () => {
    return (
        <div className="roadmap-wrapper">
            <h1>Game Developer Roadmap</h1>

            <div className="roadmap-grid">
                {sections.map((section, i) => (
                    <div className="roadmap-card" key={i}>
                        <h3>{section.title}</h3>

                        <div className="roadmap-items">
                            {section.items.map((item, j) => (
                                <span key={j} className="roadmap-chip">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameRoadmap;