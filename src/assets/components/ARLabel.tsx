import React, { useState } from "react";
import { AnatomicalPoint } from "../data/anatomicalData";

interface ARLabelProps {
  point: AnatomicalPoint;
  language: "en" | "fil";
  screenPosition: { x: number; y: number };
  isVisible: boolean;
  onClick: () => void;
  isSelected: boolean;
}

const ARLabel: React.FC<ARLabelProps> = ({
  point,
  language,
  screenPosition,
  isVisible,
  onClick,
  isSelected,
}) => {
  const [showDetailed, setShowDetailed] = useState(false);

  if (!isVisible) return null;

  return (
    <>      {/* Main Label */}
      <div
        onClick={onClick}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
        data-ui-element="true"
        style={{
          position: "absolute",
          left: `${screenPosition.x}px`,
          top: `${screenPosition.y}px`,
          transform: "translate(-50%, -100%)",
          backgroundColor: isSelected
            ? "rgba(255, 107, 107, 0.9)"
            : "rgba(52, 152, 219, 0.9)",
          color: "white",
          padding: "8px 12px",
          borderRadius: "20px",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
          userSelect: "none",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          backdropFilter: "blur(10px)",
          transition: "all 0.3s ease",
          zIndex: 100,
          maxWidth: "200px",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          touchAction: "manipulation",
        }}
      >
        {/* Arrow pointing to anatomical part */}
        <div
          style={{
            position: "absolute",
            bottom: "-8px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "0",
            height: "0",
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: `8px solid ${
              isSelected ? "rgba(255, 107, 107, 0.9)" : "rgba(52, 152, 219, 0.9)"
            }`,
          }}
        />
        
        <span>{point.title[language]}</span>        {/* Info icon */}
        <span
          onClick={(e) => {
            e.stopPropagation();
            setShowDetailed(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowDetailed(true);
          }}
          data-ui-element="true"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: "50%",
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            cursor: "pointer",
            touchAction: "manipulation",
          }}
        >
          ℹ️
        </span>
      </div>

      {/* Quick Description (when selected) */}
      {isSelected && (
        <div
          style={{
            position: "absolute",
            left: `${screenPosition.x}px`,
            top: `${screenPosition.y + 40}px`,
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            color: "white",
            padding: "12px 16px",
            borderRadius: "12px",
            fontSize: "13px",
            maxWidth: "280px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
            zIndex: 99,
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <p style={{ margin: "0 0 8px 0", fontWeight: "500" }}>
            {point.description[language]}
          </p>
          <div
            style={{
              fontSize: "11px",
              color: "#4ECDC4",
              fontStyle: "italic",
            }}
          >
            💡 {point.funFact[language]}
          </div>
        </div>
      )}

      {/* Detailed Information Modal */}
      {showDetailed && (        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: "20px",
          }}
          data-ui-element="true"
          onClick={() => setShowDetailed(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            data-ui-element="true"
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "500px",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                borderBottom: "2px solid #f0f0f0",
                paddingBottom: "12px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "#2c3e50",
                  fontSize: "20px",
                  fontWeight: "700",
                }}
              >
                {point.title[language]}
              </h3>              <button
                onClick={() => setShowDetailed(false)}
                data-ui-element="true"
                style={{
                  backgroundColor: "#e74c3c",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div style={{ lineHeight: "1.6", color: "#34495e" }}>
              {/* Description */}
              <div style={{ marginBottom: "16px" }}>
                <h4
                  style={{
                    color: "#3498db",
                    fontSize: "16px",
                    marginBottom: "8px",
                  }}
                >
                  📖 Overview
                </h4>
                <p style={{ margin: 0, fontSize: "14px" }}>
                  {point.description[language]}
                </p>
              </div>

              {/* Detailed Information */}
              <div style={{ marginBottom: "16px" }}>
                <h4
                  style={{
                    color: "#2ecc71",
                    fontSize: "16px",
                    marginBottom: "8px",
                  }}
                >
                  🔬 Detailed Information
                </h4>
                <p style={{ margin: 0, fontSize: "14px" }}>
                  {point.detailedInfo[language]}
                </p>
              </div>

              {/* Fun Fact */}
              <div
                style={{
                  backgroundColor: "#fff3cd",
                  border: "1px solid #ffeaa7",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "16px",
                }}
              >
                <h4
                  style={{
                    color: "#f39c12",
                    fontSize: "16px",
                    marginBottom: "8px",
                  }}
                >
                  💡 Fun Fact
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    fontStyle: "italic",
                    color: "#8b7355",
                  }}
                >
                  {point.funFact[language]}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ARLabel;
