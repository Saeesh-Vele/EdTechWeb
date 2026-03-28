import React from "react";
import "./BlockChain.css";
import roadmap from "../../../../assets/roadmaps/blockchain.jpeg";

const BlockChain: React.FC = () => {
    return (
        <div className="roadmap-wrapper">
            <h1 className="roadmap-title">BlockChain Roadmap</h1>

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
