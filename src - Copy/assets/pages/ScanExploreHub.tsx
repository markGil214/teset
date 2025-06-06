import React, { useEffect } from "react";
import { organs } from "../components/organData";
import { useNavigate } from "react-router-dom";
import "./ScanExploreHub.css";

const ScanExploreHub: React.FC = () => {
  const navigate = useNavigate();

  // Ensure clean state when returning to hub
  useEffect(() => {
    console.log("=== ScanExploreHub mounted - ensuring clean state ===");
    
    // Clear any lingering AR-related DOM elements
    const canvasElements = document.querySelectorAll("canvas");
    canvasElements.forEach((canvas) => {
      if (canvas.parentElement === document.body && canvas.style.position === "absolute") {
        console.log("Removing lingering canvas element");
        document.body.removeChild(canvas);
      }
    });

    // Clear any lingering video elements
    const videoElements = document.querySelectorAll("video");
    videoElements.forEach((video) => {
      if (video.parentElement === document.body) {
        console.log("Removing lingering video element");
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          video.srcObject = null;
        }
        document.body.removeChild(video);
      }
    });

    // Restore normal body overflow
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    
    console.log("ScanExploreHub cleanup completed");
  }, []);

  // Handle organ selection with clean navigation
  const handleOrganClick = (organId: string) => {
    console.log(`=== Navigating to AR Scanner for ${organId} ===`);
    // Use replace instead of push to avoid back button issues
    navigate(`/scan-explore/ar?organ=${organId}`, { replace: false });
  };

  return (
    <div className="scan-explore-hub">
      <h1>Scan & Explore</h1>
      <div className="organ-grid">
        {organs.map((organ) => (
          <div
            key={organ.id}
            className="organ-card"
            onClick={() => handleOrganClick(organ.id)}
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
