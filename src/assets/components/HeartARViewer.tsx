import React, { useEffect } from "react";
import "aframe";
// Need to import AFRAME first before these imports
import "networked-aframe";

// Script imports rather than dynamic loading
const injectARScript = () => {
  const script = document.createElement("script");
  script.src =
    "https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js";
  script.async = true;
  document.head.appendChild(script);
  return script;
};

// Remove the type declarations from this file and place them in a new file named 'custom-aframe-jsx.d.ts' in your 'src' folder.

interface HeartARViewerProps {
  onBack: () => void;
}

const HeartARViewer: React.FC<HeartARViewerProps> = ({ onBack }) => {
  useEffect(() => {
    // Add AR.js script
    const script = injectARScript();

    // Clean up script when component unmounts
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
      }}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          position: "fixed",
          top: "10px",
          left: "10px",
          zIndex: 2000,
          backgroundColor: "#e78c11",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "8px 16px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Back
      </button>

      {/* Get Marker button */}
      <button
        onClick={() => window.open("/marker.html", "_blank")}
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          zIndex: 2000,
          backgroundColor: "#4a5dbd",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "8px 16px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Get Marker
      </button>

      {/* Instructions */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "10px 20px",
          borderRadius: "10px",
          zIndex: 2000,
          textAlign: "center",
          maxWidth: "80%",
        }}
      >
        <p>Scan the Hiro marker to see the 3D heart model</p>
      </div>

      {/* A-Frame Scene using dangerouslySetInnerHTML to avoid TypeScript errors */}
      <div
        dangerouslySetInnerHTML={{
          __html: `
          <a-scene
            embedded
            arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
            renderer="logarithmicDepthBuffer: true;"
            vr-mode-ui="enabled: false"
          >
            <a-assets>
              <a-asset-item
                id="heart-model"
                src="/realistic_human_heart.glb"
              ></a-asset-item>
            </a-assets>

            <a-marker preset="hiro">
              <a-entity
                position="0 0.5 0"
                rotation="0 0 0"
                scale="0.5 0.5 0.5"
                gltf-model="#heart-model"
                animation="property: rotation; to: 0 360 0; loop: true; dur: 10000; easing: linear;"
              ></a-entity>
            </a-marker>

            <a-entity camera></a-entity>
          </a-scene>
        `,
        }}
      />
    </div>
  );
};

export default HeartARViewer;
