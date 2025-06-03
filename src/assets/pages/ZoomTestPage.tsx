import React, { useEffect, useRef, useState, useCallback } from "react";
import { ZoomController } from "../../utils/ZoomController";
import ARControls from "../components/ARControls";

const ZoomTestPage: React.FC = () => {
  const [currentZoom, setCurrentZoom] = useState(1.0);
  const [isZoomAnimating, setIsZoomAnimating] = useState(false);
  const zoomControllerRef = useRef<ZoomController | null>(null);
  const testBoxRef = useRef<HTMLDivElement>(null);

  // Initialize zoom controller
  useEffect(() => {
    console.log('Initializing zoom controller for test page');

    zoomControllerRef.current = new ZoomController(1.0, {
      onZoomChange: (zoom: number) => {
        console.log(`ZoomTestPage: Zoom changed to: ${zoom}x`);
        setCurrentZoom(zoom);
        // Apply zoom to the test box
        if (testBoxRef.current) {
          console.log(`ZoomTestPage: Applying transform scale(${zoom})`);
          testBoxRef.current.style.transform = `scale(${zoom})`;
        } else {
          console.log('ZoomTestPage: Test box not found');
        }
      },
      onThresholdCrossed: (threshold: string, zoom: number) => {
        console.log(`ZoomTestPage: Zoom threshold crossed: ${threshold} at ${zoom}x`);
      }
    });

    console.log('Zoom controller initialized for test page');

    return () => {
      console.log('Cleaning up zoom controller for test page');
      zoomControllerRef.current?.destroy();
    };
  }, []);

  // Zoom control handlers
  const handleZoomIn = useCallback(() => {
    console.log('=== ZoomTestPage: Zoom In button clicked ===');
    console.log('ZoomController exists:', !!zoomControllerRef.current);
    console.log('Test box exists:', !!testBoxRef.current);
    if (zoomControllerRef.current) {
      console.log('Current zoom before zoomIn:', zoomControllerRef.current.getCurrentZoom());
      zoomControllerRef.current.zoomIn();
    } else {
      console.error('ZoomController not initialized!');
    }
    setIsZoomAnimating(true);
    setTimeout(() => setIsZoomAnimating(false), 300);
  }, []);

  const handleZoomOut = useCallback(() => {
    console.log('=== ZoomTestPage: Zoom Out button clicked ===');
    console.log('ZoomController exists:', !!zoomControllerRef.current);
    console.log('Test box exists:', !!testBoxRef.current);
    if (zoomControllerRef.current) {
      console.log('Current zoom before zoomOut:', zoomControllerRef.current.getCurrentZoom());
      zoomControllerRef.current.zoomOut();
    } else {
      console.error('ZoomController not initialized!');
    }
    setIsZoomAnimating(true);
    setTimeout(() => setIsZoomAnimating(false), 300);
  }, []);

  const handleResetZoom = useCallback(() => {
    console.log('=== ZoomTestPage: Reset Zoom button clicked ===');
    console.log('ZoomController exists:', !!zoomControllerRef.current);
    console.log('Test box exists:', !!testBoxRef.current);
    if (zoomControllerRef.current) {
      console.log('Current zoom before reset:', zoomControllerRef.current.getCurrentZoom());
      zoomControllerRef.current.resetZoom();
    } else {
      console.error('ZoomController not initialized!');
    }
    setIsZoomAnimating(true);
    setTimeout(() => setIsZoomAnimating(false), 300);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#f0f0f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Zoom Controller Test</h1>
      
      <div
        ref={testBoxRef}
        style={{
          width: '200px',
          height: '200px',
          backgroundColor: 'blue',
          margin: '20px',
          transition: 'transform 0.3s ease',
          transformOrigin: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold'
        }}
      >
        Test Box<br/>
        Scale: {currentZoom.toFixed(1)}x
      </div>

      <div style={{ margin: '20px', textAlign: 'center' }}>
        <p>Current Zoom: <strong>{currentZoom.toFixed(1)}x</strong></p>
        <p>Animation: {isZoomAnimating ? 'Active' : 'Inactive'}</p>
        <p style={{ fontSize: '12px', color: '#666' }}>
          Open browser console to see detailed logs
        </p>
      </div>

      {/* Zoom Controls */}
      <ARControls
        currentZoom={currentZoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        isAnimating={isZoomAnimating}
        disabled={false}
      />

      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        cursor: 'pointer'
      }}
      onClick={() => window.history.back()}>
        ← Back to Menu
      </div>
    </div>
  );
};

export default ZoomTestPage;
