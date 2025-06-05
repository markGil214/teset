import React from "react";
import { HeartPart } from "../data/heartPartsData";

interface HeartInfoPanelProps {
  selectedPart: HeartPart | null;
  onClose: () => void;
}

const HeartInfoPanel: React.FC<HeartInfoPanelProps> = ({
  selectedPart,
  onClose,
}) => {
  if (!selectedPart) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        top: "20%",
        transform: "translateX(-50%)",
        zIndex: 2000,
        pointerEvents: "auto",
        userSelect: "none",
        maxWidth: "90vw",
        width: "350px",
      }}
      data-ui-element="true"
    >
      <div
        style={{
          backgroundColor: "rgba(44, 62, 80, 0.95)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "none",
            border: "none",
            color: "white",
            fontSize: "20px",
            cursor: "pointer",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.backgroundColor = "transparent";
          }}
        >
          ×
        </button>

        {/* Color indicator */}
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: selectedPart.color,
            display: "inline-block",
            marginRight: "10px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        />

        {/* Title */}
        <h3
          style={{
            margin: "0 0 15px 0",
            color: "#f39c12",
            fontSize: "18px",
            fontWeight: "600",
            display: "inline",
          }}
        >
          {selectedPart.name}
        </h3>

        {/* Description */}
        <p
          style={{
            margin: "0 0 15px 0",
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#ecf0f1",
          }}
        >
          {selectedPart.description}
        </p>

        {/* Detailed info if available */}
        {selectedPart.detailedInfo && (
          <div
            style={{
              backgroundColor: "rgba(52, 73, 94, 0.6)",
              padding: "12px",
              borderRadius: "8px",
              marginTop: "10px",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <h4
              style={{
                margin: "0 0 8px 0",
                fontSize: "12px",
                color: "#bdc3c7",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Additional Information
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                lineHeight: "1.4",
                color: "#ecf0f1",
              }}
            >
              {selectedPart.detailedInfo}
            </p>
          </div>
        )}

        {/* Part ID indicator */}
        <div
          style={{
            marginTop: "15px",
            fontSize: "11px",
            color: "#95a5a6",
            textAlign: "center",
          }}
        >
          Part {selectedPart.id} of 8
        </div>
      </div>
    </div>
  );
};

export default HeartInfoPanel;
