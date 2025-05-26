import React, { useEffect, useState, useRef } from "react";

interface HeartARViewerProps {
  onBack: () => void;
}

const HeartARViewer: React.FC<HeartARViewerProps> = ({ onBack }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sceneContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load required scripts
    const loadScripts = async () => {
      try {
        // Load AFrame first
        await loadScript("https://aframe.io/releases/1.4.2/aframe.min.js");
        console.log("A-Frame loaded successfully");

        // Then load AR.js
        await loadScript(
          "https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"
        );
        console.log("AR.js loaded successfully");

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading scripts:", error);
        setErrorMessage(
          "Failed to load AR components. Please check your connection."
        );
      }
    };

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;

        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error(`Failed to load script: ${src}`));

        document.head.appendChild(script);
      });
    };

    // Request camera permission
    const requestCameraPermission = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { exact: "environment" },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });
          // Stop stream as AR.js will request it again
          stream.getTracks().forEach((track) => track.stop());
          console.log("Camera permission granted");
        } catch (error) {
          console.error("Camera permission error:", error);
          setErrorMessage("Camera access is required for AR features");
        }
      }
    };

    // Load scripts and request camera permission
    loadScripts().then(() => {
      requestCameraPermission();
    });

    // Clean up when component unmounts
    return () => {
      // Nothing specific to clean up as the scripts remain loaded
    };
  }, []);

  // Create AR scene with HTML string
  const createARScene = () => {
    return {
      __html: `
        <a-scene
          embedded  style="position: absolute; top: 0; left: 0; width: 100vw; height: 100vh;"
        arjs="sourceType: webcam; sourceWidth: 1280; sourceHeight: 720; displayWidth: 1280; displayHeight: 720; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"

        >
          <a-assets>
            <a-asset-item
              id="heart-model"
              src="/realistic_human_heart/scene.gltf"
              response-type="arraybuffer"
            ></a-asset-item>
          </a-assets>

          <a-marker preset="hiro">
            <a-entity
              position="0 0 0"
              rotation="0 0 0"
              scale="2 2 2"
              gltf-model="#heart-model"
              animation="property: rotation; to: 0 360 0; loop: true; dur: 10000; easing: linear;"
            ></a-entity>
          </a-marker>

          <a-entity camera></a-entity>
        </a-scene>
      `,
    };
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        zIndex: 1000,
      }}
    >
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            color: "white",
            backgroundColor: "rgba(0,0,0,0.7)",
          }}
        >
          <p>Loading AR components...</p>
        </div>
      ) : (
        <div
          ref={sceneContainerRef}
          style={{
            width: "100vw",
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
          }}
          dangerouslySetInnerHTML={createARScene()}
        />
      )}

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

      {/* Error message */}
      {errorMessage && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(255,0,0,0.7)",
            color: "white",
            padding: "20px",
            borderRadius: "10px",
            zIndex: 3000,
            textAlign: "center",
            maxWidth: "80%",
          }}
        >
          <p>{errorMessage}</p>
          <button
            onClick={() => setErrorMessage(null)}
            style={{
              marginTop: "10px",
              backgroundColor: "white",
              color: "red",
              border: "none",
              borderRadius: "5px",
              padding: "5px 10px",
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Instructions */}
    </div>
  );
};

export default HeartARViewer;
