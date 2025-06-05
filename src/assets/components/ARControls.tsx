import React, { useState, useEffect } from "react";
import { ZoomControlsProps } from "../../types/ZoomTypes";

interface ExtendedZoomControlsProps extends ZoomControlsProps {
  onResetZoom?: () => void;
  showMaxZoomMessage?: boolean;
  onMaxZoomMessageShown?: () => void;
  organId?: string;
  showSlicedModel?: boolean;
}

const ARControls: React.FC<ExtendedZoomControlsProps> = ({
  currentZoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  isAnimating,
  disabled = false,
  showMaxZoomMessage = false,
  onMaxZoomMessageShown,
  organId,
  showSlicedModel = false,
}) => {
  const [showMessage, setShowMessage] = useState(false);

  // Add CSS animation styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(10px) scale(0.9); }
        20% { opacity: 1; transform: translateY(0) scale(1); }
        80% { opacity: 1; transform: translateY(0) scale(1); }
        100% { opacity: 0; transform: translateY(-10px) scale(0.9); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Show/hide max zoom message
  useEffect(() => {
    if (showMaxZoomMessage && (organId !== 'heart' || !showSlicedModel)) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
        // Reset the parent component's showMaxZoomMessage state
        onMaxZoomMessageShown?.();
      }, 3000); // Hide after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [showMaxZoomMessage, onMaxZoomMessageShown, organId, showSlicedModel]);

  const canZoomIn = currentZoom < 3.0 && !isAnimating && !disabled;
  const canZoomOut = currentZoom > 0.5 && !isAnimating && !disabled;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* Max Zoom Message */}
      {showMessage && (
        <div
          style={{
            position: "absolute",
            bottom: "250px",
            right: "0px",
            backgroundColor: "rgba(255, 87, 34, 0.95)",
            color: "white",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "bold",
            textAlign: "center",
            minWidth: "200px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
            animation: "fadeInOut 3s ease-in-out",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          {organId === 'heart' 
            ? '🔍 Transitioning to sliced heart model...' 
            : '🔍 You reached full display of 3D!'
          }
        </div>
      )}
      {/* Zoom In Button */}
      <button
        onClick={onZoomIn}
        disabled={!canZoomIn}
        data-ui-element="true"
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "none",
          backgroundColor: canZoomIn
            ? "rgba(0, 123, 255, 0.9)"
            : "rgba(128, 128, 128, 0.5)",
          color: "white",
          fontSize: "24px",
          fontWeight: "bold",
          cursor: canZoomIn ? "pointer" : "not-allowed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          transition: "all 0.2s ease",
          transform: isAnimating ? "scale(0.95)" : "scale(1)",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTapHighlightColor: "transparent",
          pointerEvents: "auto",
          position: "relative",
          zIndex: 200,
        }}
        onMouseDown={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
      >
        🔍+
      </button>
      {/* Zoom Level Indicator */}
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "8px 12px",
          borderRadius: "20px",
          fontSize: "14px",
          fontWeight: "bold",
          textAlign: "center",
          minWidth: "60px",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {currentZoom.toFixed(1)}x
      </div>
      {/* Zoom Out Button */}
      <button
        onClick={onZoomOut}
        disabled={!canZoomOut}
        data-ui-element="true"
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "none",
          backgroundColor: canZoomOut
            ? "rgba(0, 123, 255, 0.9)"
            : "rgba(128, 128, 128, 0.5)",
          color: "white",
          fontSize: "24px",
          fontWeight: "bold",
          cursor: canZoomOut ? "pointer" : "not-allowed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          transition: "all 0.2s ease",
          transform: isAnimating ? "scale(0.95)" : "scale(1)",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTapHighlightColor: "transparent",
          pointerEvents: "auto",
          position: "relative",
          zIndex: 200,
        }}
        onMouseDown={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
      >
        🔍-
      </button>{" "}
      {/* Reset Zoom Button */}
      <button
        onClick={onResetZoom}
        disabled={currentZoom === 1.0 || isAnimating || disabled}
        data-ui-element="true"
        style={{
          width: "60px",
          height: "30px",
          borderRadius: "15px",
          border: "none",
          backgroundColor:
            currentZoom !== 1.0 && !isAnimating && !disabled
              ? "rgba(255, 193, 7, 0.9)"
              : "rgba(128, 128, 128, 0.5)",
          color: "white",
          fontSize: "12px",
          fontWeight: "bold",
          cursor:
            currentZoom !== 1.0 && !isAnimating && !disabled
              ? "pointer"
              : "not-allowed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          transition: "all 0.2s ease",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTapHighlightColor: "transparent",
          pointerEvents: "auto",
          position: "relative",
          zIndex: 200,
        }}
        onMouseDown={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
      >
        RESET
      </button>
    </div>
  );
};

export default ARControls;
