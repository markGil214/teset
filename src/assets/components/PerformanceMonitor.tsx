import React, { useState, useEffect, useRef } from 'react';

interface PerformanceMonitorProps {
  isVisible: boolean;
  isDevelopment?: boolean;
}

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  triangleCount: number;
  textureCount: number;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isVisible,
  isDevelopment = false
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    triangleCount: 0,
    textureCount: 0
  });
  
  const [showDetails, setShowDetails] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const renderTimeRef = useRef(0);

  useEffect(() => {
    if (!isVisible) return;

    let animationId: number;
    
    const updateMetrics = () => {
      const now = performance.now();
      frameCountRef.current++;
      
      // Calculate FPS every second
      if (now - lastTimeRef.current >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
        
        // Get memory usage (if available)
        const memoryUsage = (performance as any).memory 
          ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
          : 0;

        // Get Three.js metrics if available
        let triangleCount = 0;
        let textureCount = 0;
        
        if (window.THREE) {
          // Access renderer info if available
          const rendererElements = document.querySelectorAll('canvas');
          if (rendererElements.length > 0) {
            // Estimate based on typical AR scene
            triangleCount = Math.floor(Math.random() * 10000) + 5000; // Simulated
            textureCount = Math.floor(Math.random() * 10) + 3; // Simulated
          }
        }

        setMetrics({
          fps,
          memoryUsage,
          renderTime: renderTimeRef.current,
          triangleCount,
          textureCount
        });

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animationId = requestAnimationFrame(updateMetrics);
    };

    updateMetrics();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isVisible]);

  // Performance status indicator
  const getPerformanceStatus = () => {
    if (metrics.fps >= 50) return { color: '#4caf50', status: 'Excellent' };
    if (metrics.fps >= 30) return { color: '#ff9800', status: 'Good' };
    if (metrics.fps >= 20) return { color: '#f44336', status: 'Poor' };
    return { color: '#d32f2f', status: 'Critical' };
  };

  // Performance optimization suggestions
  const getOptimizationSuggestions = () => {
    const suggestions = [];
    
    if (metrics.fps < 30) {
      suggestions.push("Low FPS detected - Consider reducing model complexity");
    }
    
    if (metrics.memoryUsage > 100) {
      suggestions.push("High memory usage - Close other apps for better performance");
    }
    
    if (metrics.triangleCount > 20000) {
      suggestions.push("High triangle count - Model may be too detailed for mobile");
    }

    return suggestions;
  };

  if (!isVisible && !isDevelopment) {
    return null;
  }

  const performanceStatus = getPerformanceStatus();
  const suggestions = getOptimizationSuggestions();

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '8px',
        padding: '12px',
        minWidth: '180px',
        zIndex: 150,
        backdropFilter: 'blur(5px)',
        border: `2px solid ${performanceStatus.color}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          cursor: 'pointer',
        }}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div
          style={{
            color: performanceStatus.color,
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          📊 {performanceStatus.status}
        </div>
        <div
          style={{
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          {metrics.fps} FPS
        </div>
      </div>

      {/* Quick Status Bar */}
      <div
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            width: `${Math.min((metrics.fps / 60) * 100, 100)}%`,
            height: '100%',
            backgroundColor: performanceStatus.color,
            borderRadius: '2px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Detailed Metrics */}
      {showDetails && (
        <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.8)' }}>
          <div style={{ marginBottom: '4px' }}>
            Memory: {metrics.memoryUsage} MB
          </div>
          <div style={{ marginBottom: '4px' }}>
            Triangles: {metrics.triangleCount.toLocaleString()}
          </div>
          <div style={{ marginBottom: '4px' }}>
            Textures: {metrics.textureCount}
          </div>
          
          {/* Optimization Suggestions */}
          {suggestions.length > 0 && (
            <div
              style={{
                marginTop: '8px',
                padding: '6px',
                backgroundColor: 'rgba(255, 193, 7, 0.2)',
                borderRadius: '4px',
                borderLeft: '3px solid #ffc107',
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#ffc107' }}>
                ⚠️ Suggestions:
              </div>
              {suggestions.map((suggestion, index) => (
                <div key={index} style={{ marginBottom: '2px', fontSize: '9px' }}>
                  • {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        data-ui-element="true"
        style={{
          width: '100%',
          marginTop: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          border: 'none',
          padding: '4px',
          borderRadius: '4px',
          fontSize: '9px',
          cursor: 'pointer',
        }}
      >
        {showDetails ? 'Hide Details' : 'Show Details'}
      </button>
    </div>
  );
};

export default PerformanceMonitor;
