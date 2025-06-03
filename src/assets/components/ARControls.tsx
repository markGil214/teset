// Zoom and interaction controls for AR heart visualization
import React from "react";
import { ARControlsProps } from "../../types/ARTypes";

interface ExtendedARControlsProps extends ARControlsProps {
  currentViewState: "normal" | "slicing" | "labeled" | "detailed";
  onReset: () => void;
}

export const ARControls: React.FC<ExtendedARControlsProps> = ({
  currentZoom,
  onZoomIn,
  onZoomOut,
  onReset,
  isAnimating,
  currentViewState,
  disabled = false,
}) => {
  const formatZoom = (zoom: number): string => {
    return `${Math.round(zoom * 100)}%`;
  };

  const getViewStateText = (state: string): string => {
    switch (state) {
      case "normal":
        return "Normal View";
      case "slicing":
        return "Heart Slicing";
      case "labeled":
        return "Anatomy Labels";
      case "detailed":
        return "Full Details";
      default:
        return "Normal View";
    }
  };

  const getViewStateColor = (state: string): string => {
    switch (state) {
      case "normal":
        return "#4CAF50";
      case "slicing":
        return "#FF9800";
      case "labeled":
        return "#2196F3";
      case "detailed":
        return "#9C27B0";
      default:
        return "#4CAF50";
    }
  };

  return (
    <div className="ar-controls">
      {/* Zoom Controls */}
      <div className="zoom-controls">
        <button
          className="zoom-btn zoom-out"
          onClick={onZoomOut}
          disabled={disabled || isAnimating || currentZoom <= 0.5}
          aria-label="Zoom Out"
        >
          <span className="zoom-icon">🔍−</span>
        </button>

        <div className="zoom-display">
          <span className="zoom-level">{formatZoom(currentZoom)}</span>
          <div className="zoom-progress">
            <div
              className="zoom-progress-bar"
              style={{
                width: `${((currentZoom - 0.5) / (3.0 - 0.5)) * 100}%`,
              }}
            />
          </div>
        </div>

        <button
          className="zoom-btn zoom-in"
          onClick={onZoomIn}
          disabled={disabled || isAnimating || currentZoom >= 3.0}
          aria-label="Zoom In"
        >
          <span className="zoom-icon">🔍+</span>
        </button>
      </div>

      {/* View State Indicator */}
      <div className="view-state-indicator">
        <div
          className="state-badge"
          style={{ backgroundColor: getViewStateColor(currentViewState) }}
        >
          <span className="state-icon">
            {currentViewState === "normal" && "❤️"}
            {currentViewState === "slicing" && "🔪"}
            {currentViewState === "labeled" && "🏷️"}
            {currentViewState === "detailed" && "📊"}
          </span>
          <span className="state-text">
            {getViewStateText(currentViewState)}
          </span>
        </div>
      </div>

      {/* Reset Button */}
      <div className="control-actions">
        <button
          className="reset-btn"
          onClick={onReset}
          disabled={disabled || isAnimating}
          aria-label="Reset View"
        >
          <span className="reset-icon">🔄</span>
          <span className="reset-text">Reset</span>
        </button>
      </div>

      {/* Loading Indicator */}
      {isAnimating && (
        <div className="animation-indicator">
          <div className="loading-spinner" />
          <span>Adjusting view...</span>
        </div>
      )}
    </div>
  );
};

export default ARControls;
