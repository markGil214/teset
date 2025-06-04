import React, { useState, useEffect } from 'react';
import { ZoomController } from '../../utils/ZoomController';
import ARControls from '../components/ARControls';

const ZoomTestPage: React.FC = () => {
  const [currentZoom, setCurrentZoom] = useState(1.0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMaxZoomMessage, setShowMaxZoomMessage] = useState(false);
  const [zoomController] = useState(() => new ZoomController(1.0, {
    onZoomChange: (zoom: number) => {
      setCurrentZoom(zoom);
    },
    onMaxZoomReached: () => {
      console.log('Max zoom reached!');
      setShowMaxZoomMessage(true);
    }
  }));
  
  // Reset the max zoom message state when it's been shown
  useEffect(() => {
    if (showMaxZoomMessage) {
      const timer = setTimeout(() => {
        setShowMaxZoomMessage(false);
      }, 100); // Reset quickly so it can be triggered again
      
      return () => clearTimeout(timer);
    }
  }, [showMaxZoomMessage]);
  
  const handleZoomIn = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      zoomController.zoomIn();
      setTimeout(() => setIsAnimating(false), 300);
    }
  };
  
  const handleZoomOut = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      zoomController.zoomOut();
      setTimeout(() => setIsAnimating(false), 300);
    }
  };
  
  const handleResetZoom = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      zoomController.resetZoom();
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#f0f0f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <h1>Zoom Test Page</h1>
      <div style={{
        width: '300px',
        height: '300px',
        backgroundColor: '#007bff',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        transform: `scale(${currentZoom})`,
        transition: 'transform 0.3s ease',
        boxShadow: '0 8px 20px rgba(0, 123, 255, 0.3)',
      }}>
        3D Model Preview
        <br />
        Zoom: {currentZoom.toFixed(1)}x
      </div>
        <p style={{ marginTop: '20px', textAlign: 'center', maxWidth: '400px' }}>
        Use the zoom controls to test the maximum zoom message. 
        When you reach 3.0x zoom, you'll see the "You reached full display of 3D!" message.
      </p>
      
      <ARControls
        currentZoom={currentZoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        isAnimating={isAnimating}
        disabled={false}
        showMaxZoomMessage={showMaxZoomMessage}
      />
    </div>
  );
};

export default ZoomTestPage;