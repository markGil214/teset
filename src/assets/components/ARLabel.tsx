import React, { useState, useEffect, useRef } from 'react';
import { AnatomicalPart, Language, getLocalizedContent } from '../data/anatomicalData';

interface ARLabelProps {
  part: AnatomicalPart;
  language: Language;
  isVisible: boolean;
  onToggleDetails: (partId: string) => void;
  showDetails: boolean;
  cameraPosition?: { x: number; y: number; z: number };
  modelPosition?: { x: number; y: number; z: number };
  canvasWidth?: number;
  canvasHeight?: number;
}

interface LabelPosition {
  x: number;
  y: number;
  visible: boolean;
}

const ARLabel: React.FC<ARLabelProps> = ({
  part,
  language,
  isVisible,
  onToggleDetails,
  showDetails,
  cameraPosition = { x: 0, y: 0, z: 5 },
  modelPosition = { x: 0, y: 0, z: 0 },
  canvasWidth = 800,
  canvasHeight = 600
}) => {
  const [labelPosition, setLabelPosition] = useState<LabelPosition>({ x: 0, y: 0, visible: false });
  const labelRef = useRef<HTMLDivElement>(null);

  // Calculate 3D to 2D position conversion
  const calculate2DPosition = () => {
    // Simple perspective projection
    const worldX = modelPosition.x + part.position.x;
    const worldY = modelPosition.y + part.position.y;
    const worldZ = modelPosition.z + part.position.z;
    
    // Distance from camera
    const distance = Math.sqrt(
      Math.pow(worldX - cameraPosition.x, 2) +
      Math.pow(worldY - cameraPosition.y, 2) +
      Math.pow(worldZ - cameraPosition.z, 2)
    );
      // Perspective projection
    const fov = 50; // Field of view in degrees
    const projectionScale = (canvasHeight / 2) / Math.tan((fov * Math.PI / 180) / 2);
    
    const screenX = ((worldX - cameraPosition.x) / (worldZ - cameraPosition.z)) * projectionScale + canvasWidth / 2;
    const screenY = canvasHeight / 2 - ((worldY - cameraPosition.y) / (worldZ - cameraPosition.z)) * projectionScale;
    
    // Apply label offset
    const finalX = screenX + part.labelOffset.x;
    const finalY = screenY + part.labelOffset.y;
    
    // Check if label is within viewport and behind camera
    const visible = 
      worldZ > cameraPosition.z && // Not behind camera
      finalX >= 0 && finalX <= canvasWidth &&
      finalY >= 0 && finalY <= canvasHeight &&
      distance < 10; // Not too far away
    
    return {
      x: Math.max(10, Math.min(canvasWidth - 200, finalX)),
      y: Math.max(10, Math.min(canvasHeight - 50, finalY)),
      visible
    };
  };

  // Update label position when dependencies change
  useEffect(() => {
    if (isVisible) {
      const position = calculate2DPosition();
      setLabelPosition(position);
    }
  }, [part.position, cameraPosition, modelPosition, canvasWidth, canvasHeight, isVisible]);

  // Handle click outside to close details
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (labelRef.current && !labelRef.current.contains(event.target as Node) && showDetails) {
        onToggleDetails(part.id);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDetails, part.id, onToggleDetails]);

  if (!isVisible || !labelPosition.visible) {
    return null;
  }

  const localizedName = getLocalizedContent(part.name, language);
  const localizedDescription = getLocalizedContent(part.description, language);

  return (
    <>
      {/* Label Dot */}
      <div
        className="ar-label-dot"
        style={{
          position: 'absolute',
          left: `${labelPosition.x}px`,
          top: `${labelPosition.y}px`,
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
        }}
      >
        <div
          className="label-point"
          onClick={() => onToggleDetails(part.id)}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#ff6b6b',
            border: '2px solid white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            animation: 'pulse 2s infinite',
          }}
        />
        
        {/* Label Text */}
        <div
          className="label-text"
          style={{
            position: 'absolute',
            top: '-35px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            opacity: showDetails ? 0 : 1,
            transition: 'opacity 0.3s ease',
          }}
        >
          {localizedName}
        </div>
        
        {/* Connection Line to Details */}
        {showDetails && (
          <div
            className="connection-line"
            style={{
              position: 'absolute',
              top: '6px',
              left: '6px',
              width: '2px',
              height: '20px',
              backgroundColor: '#ff6b6b',
              transformOrigin: 'top',
              transform: 'rotate(45deg)',
            }}
          />
        )}
      </div>

      {/* Detailed Information Modal */}
      {showDetails && (
        <div
          ref={labelRef}
          className="ar-label-details"
          style={{
            position: 'absolute',
            left: `${Math.min(labelPosition.x + 30, canvasWidth - 300)}px`,
            top: `${Math.max(labelPosition.y - 50, 10)}px`,
            width: '280px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            padding: '16px',
            zIndex: 1001,
            border: '2px solid #ff6b6b',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => onToggleDetails(part.id)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'none',
              border: 'none',
              fontSize: '18px',
              color: '#666',
              cursor: 'pointer',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>

          {/* Content */}
          <div>
            <h3
              style={{
                margin: '0 0 12px 0',
                color: '#ff6b6b',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              {localizedName}
            </h3>
            
            <p
              style={{
                margin: '0',
                color: '#333',
                fontSize: '14px',
                lineHeight: '1.4',
              }}
            >
              {localizedDescription}
            </p>
          </div>

          {/* Pointer Arrow */}
          <div
            style={{
              position: 'absolute',
              left: '-8px',
              top: '20px',
              width: '0',
              height: '0',
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderRight: '8px solid white',
            }}
          />
        </div>
      )}      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.7;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .ar-label-dot:hover .label-point {
            transform: scale(1.3);
            transition: transform 0.2s ease;
          }

          .ar-label-details {
            backdrop-filter: blur(10px);
          }
        `}
      </style>
    </>
  );
};

export default ARLabel;