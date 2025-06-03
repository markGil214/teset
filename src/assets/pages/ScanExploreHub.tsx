import React from "react";
import { organs } from "../components/organData";
import { useNavigate } from "react-router-dom";
import "./ScanExploreHub.css";

const ScanExploreHub: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="scan-explore-hub">
      <h1>Scan & Explore</h1>
      <div className="organ-grid">
        {organs.map((organ) => (
          <div
            key={organ.id}
            className="organ-card"
            onClick={() => navigate(`/scan-explore/ar?organ=${organ.id}`)}
          >
            <img src={organ.image} alt={organ.name} className="organ-image" />
            <div className="organ-name">{organ.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScanExploreHub;
