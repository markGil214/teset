import React from "react";
import { HeartPart } from "../data/heartPartsData";

interface HeartLabelProps {
  part: HeartPart;
  screenPosition: { x: number; y: number };
  isVisible: boolean;
  isSelected: boolean;
  onClick: () => void;
  scale?: number;
}

const HeartLabel: React.FC<HeartLabelProps> = ({
  part,
  screenPosition,
  isVisible,
  isSelected,
  onClick,
  scale = 1,
}) => {
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: `${screenPosition.x}px`,
        top: `${screenPosition.y}px`,
        transform: "translate(-50%, -50%)",
        zIndex: 1000,
        pointerEvents: "auto",
        userSelect: "none",
      }}
    >
      {/* Label Point - Similar to sample App.tsx */}
      <div
        onClick={onClick}
        style={{
          width: `${24 * scale}px`,
          height: `${24 * scale}px`,
          borderRadius: "50%",
          backgroundColor: isSelected ? "#f39c12" : part.color,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: `${12 * scale}px`,
          fontWeight: "bold",
          border: "2px solid white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          transition: "all 0.3s ease",
          animation: isSelected ? "pulse 1.5s infinite" : "none",
        }}
        data-ui-element="true"
      >
        {part.id}
      </div>

      {/* Leader line connecting to the label */}
      <div
        style={{
          position: "absolute",
          left: `${12 * scale}px`,
          top: `${12 * scale}px`,
          width: `${30 * scale}px`,
          height: "2px",
          backgroundColor: part.color,
          transform: "translateY(-1px)",
          opacity: 0.8,
        }}
      />

      {/* Label text */}
      <div
        style={{
          position: "absolute",
          left: `${45 * scale}px`,
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: `${4 * scale}px ${8 * scale}px`,
          borderRadius: `${4 * scale}px`,
          fontSize: `${11 * scale}px`,
          fontWeight: "500",
          whiteSpace: "nowrap",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {part.name}
      </div>

      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }
            50% {
              transform: scale(1.1);
              box-shadow: 0 4px 16px rgba(0,0,0,0.5);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }
          }
        `}
      </style>
    </div>
  );
};

export default HeartLabel;
