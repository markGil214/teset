import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { organs } from "../components/organData";
import "../ARStyles.css";

const AR_LIBS = [
  "https://aframe.io/releases/1.4.2/aframe.min.js",
  "https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js",
];

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src='${src}']`)) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.body.appendChild(script);
  });
}

const ARScannerPage: React.FC = () => {
  const { organId } = useParams<{ organId: string }>();
  const organ = organs.find((o) => o.id === organId);
  const navigate = useNavigate();
  const [arReady, setArReady] = useState(false);
  const [error, setError] = useState("");
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all(AR_LIBS.map(loadScript))
      .then(() => setArReady(true))
      .catch(() => setError("Failed to load AR libraries."));
  }, []);

  if (!organ) return <div>Organ not found.</div>;

  return (
    <div className="ar-scanner-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h2>Scan the marker to view the {organ.name} in AR</h2>
      <button
        className="marker-btn"
        onClick={() => window.open("/marker.html", "_blank")}
      >
        Download/Print Marker
      </button>
      {error && <div className="ar-error">{error}</div>}
      <div ref={sceneRef} style={{ width: "100vw", height: "70vh" }}>
        {arReady && (
          <div
            dangerouslySetInnerHTML={{
              __html: `
                <a-scene
                  embedded
                  vr-mode-ui="enabled: false"
                  arjs="sourceType: webcam; debugUIEnabled: false;"
                  style="width: 100vw; height: 70vh;"
                >
                  <a-assets>
                    <a-asset-item id="model" src="${organ.modelPath}"></a-asset-item>
                  </a-assets>
                  <a-marker preset="hiro">
                    <a-entity
                      gltf-model="#model"
                      scale="0.5 0.5 0.5"
                      animation-mixer
                    ></a-entity>
                  </a-marker>
                  <a-entity camera></a-entity>
                </a-scene>
              `,
            }}
          />
        )}
      </div>
      <div className="ar-instructions">
        <p>1. Allow camera access if prompted.</p>
        <p>2. Point your camera at the printed marker.</p>
        <p>3. The 3D {organ.name} will appear above the marker!</p>
      </div>
    </div>
  );
};

export default ARScannerPage;
