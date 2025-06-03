import React from 'react';
import { ZoomControlsProps } from '../../types/ZoomTypes';

interface ExtendedZoomControlsProps extends ZoomControlsProps {
  onResetZoom?: () => void;
}

const ARControls: React.FC<ExtendedZoomControlsProps> = ({
  currentZoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  isAnimating,
  disabled = false
}) => {
  const canZoomIn = currentZoom < 3.0 && !isAnimating && !disabled;
  const canZoomOut = currentZoom > 0.5 && !isAnimating && !disabled;

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      {/* Zoom In Button */}
      <button
        onClick={onZoomIn}
        disabled={!canZoomIn}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: canZoomIn ? 'rgba(0, 123, 255, 0.9)' : 'rgba(128, 128, 128, 0.5)',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
          cursor: canZoomIn ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease',
          transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
        onMouseDown={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
      >
        🔍+
      </button>

      {/* Zoom Level Indicator */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
        textAlign: 'center',
        minWidth: '60px',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}>
        {(currentZoom).toFixed(1)}x
      </div>

      {/* Zoom Out Button */}
      <button
        onClick={onZoomOut}
        disabled={!canZoomOut}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: canZoomOut ? 'rgba(0, 123, 255, 0.9)' : 'rgba(128, 128, 128, 0.5)',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
          cursor: canZoomOut ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease',
          transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
        onMouseDown={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
      >
        🔍-
      </button>      {/* Reset Zoom Button */}
      <button
        onClick={onResetZoom}
        disabled={currentZoom === 1.0 || isAnimating || disabled}
        style={{
          width: '60px',
          height: '30px',
          borderRadius: '15px',
          border: 'none',
          backgroundColor: (currentZoom !== 1.0 && !isAnimating && !disabled) 
            ? 'rgba(255, 193, 7, 0.9)' 
            : 'rgba(128, 128, 128, 0.5)',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: (currentZoom !== 1.0 && !isAnimating && !disabled) ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
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
