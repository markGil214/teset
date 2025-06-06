import React from "react";
import { useNavigate } from "react-router-dom";

interface ARHeaderProps {
  organName: string;
  modelLoading: boolean;
  modelError: boolean;
}

const ARHeader: React.FC<ARHeaderProps> = ({
  organName,
  modelLoading,
  modelError,
}) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        right: "10px",
        zIndex: 100,
      }}
    >
      <div>
        AR Scanner for <strong>{organName}</strong> - Point your camera at the
        Hiro marker
      </div>

      {modelLoading && (
        <div
          style={{
            backgroundColor: "rgba(0, 123, 255, 0.8)",
            padding: "8px",
            marginTop: "10px",
            borderRadius: "4px",
            color: "white",
          }}
        >
          🔄 Loading {organName} 3D model...
        </div>
      )}

      {modelError && (
        <div
          style={{
            backgroundColor: "rgba(255, 193, 7, 0.8)",
            padding: "8px",
            marginTop: "10px",
            borderRadius: "4px",
            color: "black",
          }}
        >
          ⚠️ Model loading failed - showing fallback cube
        </div>
      )}

      <div
        id="button"
        data-ui-element="true"
        style={{
          backgroundColor: "rgba(201, 76, 76, 0.3)",
          padding: "8px",
          marginTop: "10px",
          cursor: "pointer",
          pointerEvents: "auto",
          position: "relative",
          zIndex: 100,
        }}
        onClick={() => navigate(-1)}
      >
        ← Back to Menu [{organName} 3D Model]
      </div>
    </div>
  );
};

export default ARHeader;
