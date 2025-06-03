import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { organs } from "../components/organData";
import { ZoomController } from "../../utils/ZoomController";
import { HeartAnimationController } from "../../utils/HeartAnimationController";
import { PerformanceMonitor } from "../../utils/PerformanceMonitor";
import ARControls from "../components/ARControls";

// Declare global variables for the libraries
declare global {
  interface Window {
    THREE: any;
    THREEAR: any;
  }
}

const ARScannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const organId = searchParams.get("organ");
  const organ = organs.find((o) => o.id === organId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelError, setModelError] = useState(false);
    // Zoom state
  const [currentZoom, setCurrentZoom] = useState(1.0);
  const [isZoomAnimating, setIsZoomAnimating] = useState(false);
  const zoomControllerRef = useRef<ZoomController | null>(null);
  const organModelRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);
  const baseScaleRef = useRef<number>(0.5);
  
  // Heart animation state (for Phase 2)
  const heartAnimationControllerRef = useRef<HeartAnimationController | null>(null);
  const [isHeartSliced, setIsHeartSliced] = useState(false);
  const [isHeartSlicing, setIsHeartSlicing] = useState(false);

  // Performance monitoring
  const performanceMonitorRef = useRef<PerformanceMonitor | null>(null);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  if (!organ) {
    return <div>Organ not found</div>;
  }
  // Get base scale for organ type
  const getBaseScale = useCallback((organId: string): number => {
    switch (organId) {
      case "brain": return 0.3;
      case "heart": return 0.8;
      case "kidney": return 0.4;
      case "lungs": return 0.6;
      case "skin": return 0.5;
      default: return 0.5;
    }
  }, []);
  // Initialize zoom controller
  useEffect(() => {
    const baseScale = getBaseScale(organ.id);
    baseScaleRef.current = baseScale;
    console.log(`Initializing zoom controller for ${organ.name} with base scale ${baseScale}`);    zoomControllerRef.current = new ZoomController(1.0, {
      onZoomChange: (zoom: number) => {
        console.log(`ARScannerPage: Zoom changed to: ${zoom}x`);
        setCurrentZoom(zoom);
        // Apply zoom to the 3D model
        if (organModelRef.current) {
          const newScale = baseScaleRef.current * zoom;
          console.log(`ARScannerPage: Applying scale: ${newScale} (base: ${baseScaleRef.current}, zoom: ${zoom})`);
          organModelRef.current.scale.set(newScale, newScale, newScale);
          
          // If this is a heart model, trigger heart animations based on zoom level
          if (organ.id === 'heart' && heartAnimationControllerRef.current) {
            heartAnimationControllerRef.current.handleZoomChange(zoom);
          }
        } else {
          console.log('ARScannerPage: Model not loaded yet - will apply zoom when loaded');
        }
      },
      onThresholdCrossed: (threshold: string, zoom: number) => {
        console.log(`ARScannerPage: Zoom threshold crossed: ${threshold} at ${zoom}x`);
        
        // Handle threshold crossings for heart slicing
        if (organ.id === 'heart' && heartAnimationControllerRef.current) {
          if (threshold === 'startSlicing' && zoom >= 1.5) {
            console.log('🔪 Heart slicing threshold crossed');
          } else if (threshold === 'showLabels' && zoom >= 2.0) {
            console.log('🏷️ Heart labeling threshold crossed');
          }
        }
      }
    });

    console.log('Zoom controller initialized successfully');

    return () => {
      console.log('Cleaning up zoom controller');
      zoomControllerRef.current?.destroy();
    };
  }, [organ.id, getBaseScale]);  // Zoom control handlers
  const handleZoomIn = useCallback(() => {
    console.log('=== ARScannerPage: Zoom In button clicked ===');
    console.log('ZoomController exists:', !!zoomControllerRef.current);
    console.log('Model exists:', !!organModelRef.current);
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
    console.log('=== ARScannerPage: Zoom Out button clicked ===');
    console.log('ZoomController exists:', !!zoomControllerRef.current);
    console.log('Model exists:', !!organModelRef.current);
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
    console.log('=== ARScannerPage: Reset Zoom button clicked ===');
    console.log('ZoomController exists:', !!zoomControllerRef.current);
    console.log('Model exists:', !!organModelRef.current);
    if (zoomControllerRef.current) {
      console.log('Current zoom before reset:', zoomControllerRef.current.getCurrentZoom());
      zoomControllerRef.current.resetZoom();
    } else {
      console.error('ZoomController not initialized!');
    }
    setIsZoomAnimating(true);
    setTimeout(() => setIsZoomAnimating(false), 300);
  }, []);

  // Touch gesture handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    zoomControllerRef.current?.handleTouchStart(e);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    zoomControllerRef.current?.handleTouchMove(e);
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    zoomControllerRef.current?.handleTouchEnd(e);
  }, []);

  // Prevent body scrolling when AR is active
  useEffect(() => {
    // Store original overflow values
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    // Disable scrolling
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // Cleanup: restore original overflow values
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    let animationId: number;
    let renderer: any;
    let source: any;    // EXACT COPY-CAT of basic-cutout.html script section
    renderer = new window.THREE.WebGLRenderer({
      // antialias: true,
      alpha: true,
    });
    renderer.setClearColor(new window.THREE.Color("lightgrey"), 0);
    // renderer.setPixelRatio(2);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0px";
    renderer.domElement.style.left = "0px";
    document.body.appendChild(renderer.domElement);
    
    // Connect renderer to performance monitor
    if (performanceMonitorRef.current) {
      performanceMonitorRef.current.setRenderer(renderer);
    }// init scene and camera - EXACT SAME AS BASIC.HTML
    var scene = new window.THREE.Scene();
    var camera = new window.THREE.Camera();
    scene.add(camera);
    var markerGroup = new window.THREE.Group();
    scene.add(markerGroup);

    source = new window.THREEAR.Source({ renderer, camera });
    window.THREEAR.initialize({ source: source }).then((controller: any) => {
      // Add lighting for better 3D model visibility
      var ambientLight = new window.THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      var directionalLight = new window.THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight); // Load the 3D model for this organ
      var gltfLoader = new window.THREE.GLTFLoader();
      gltfLoader.load(
        organ.modelPath,        (gltf: any) => {
          var model = gltf.scene;

          // Scale and position the model appropriately for AR based on organ type
          let scale, positionY;
          switch (organ.id) {
            case "brain":
              scale = 0.3;
              positionY = 0.1;
              break;
            case "heart":
              scale = 0.8;
              positionY = 0;
              break;
            case "kidney":
              scale = 0.4;
              positionY = 0;
              break;
            case "lungs":
              scale = 0.6;
              positionY = 0;
              break;
            case "skin":
              scale = 0.5;
              positionY = 0;
              break;
            default:
              scale = 0.5;
              positionY = 0;
          }          model.scale.set(scale, scale, scale);
          model.position.y = positionY;
          markerGroup.add(model);

          // Store model reference for zoom control
          organModelRef.current = model;
          markerGroupRef.current = markerGroup;
          (markerGroup as any).organModel = model;

          // Apply current zoom level to the newly loaded model
          if (zoomControllerRef.current) {
            const currentZoomLevel = zoomControllerRef.current.getCurrentZoom();
            if (currentZoomLevel !== 1.0) {
              const newScale = scale * currentZoomLevel;
              console.log(`Applying initial zoom ${currentZoomLevel}x to loaded model: scale ${newScale}`);
              model.scale.set(newScale, newScale, newScale);
            }
          }
          
          // If this is a heart model, apply rendering optimizations
          if (organ.id === 'heart' && heartAnimationControllerRef.current) {
            heartAnimationControllerRef.current.optimizeRendering(renderer);
          }
        },
        undefined,
        (error: any) => {
          console.error("Error loading 3D model:", error);
          setModelLoading(false);
          setModelError(true);

          // Fallback: add a simple cube if model fails to load
          var geometry = new window.THREE.CubeGeometry(1, 1, 1);
          var material = new window.THREE.MeshNormalMaterial({
            transparent: true,
            opacity: 0.5,
            side: window.THREE.DoubleSide,
          });
          var cube = new window.THREE.Mesh(geometry, material);
          cube.position.y = geometry.parameters.height / 2;
          markerGroup.add(cube);
        }
      );
      var patternMarker = new window.THREEAR.PatternMarker({
        patternUrl: "/data/patt.hiro",
        markerObject: markerGroup,
      });

      controller.trackMarker(patternMarker); // Use EXACT SAME animation loop as basic.html - THIS IS KEY!
      var lastTimeMsec = 0;
      function animate(nowMsec: number) {
        // keep looping
        animationId = requestAnimationFrame(animate);
        // measure time
        lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
        var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
        lastTimeMsec = nowMsec;
        // call each update function
        controller.update(source.domElement);        // Rotate the 3D model if it's loaded
        if ((markerGroup as any).organModel) {
          // Don't rotate if heart is in sliced mode
          if (!(organ?.id === 'heart' && isHeartSliced)) {
            (markerGroup as any).organModel.rotation.y +=
              (deltaMsec / 2000) * Math.PI;
          }
        }

        renderer.render(scene, camera);
      }      animationId = requestAnimationFrame(animate);
    });

    // Add touch event listeners for pinch-to-zoom
    const handleTouchStartEvent = (e: TouchEvent) => handleTouchStart(e);
    const handleTouchMoveEvent = (e: TouchEvent) => handleTouchMove(e);
    const handleTouchEndEvent = (e: TouchEvent) => handleTouchEnd(e);

    document.addEventListener('touchstart', handleTouchStartEvent, { passive: false });
    document.addEventListener('touchmove', handleTouchMoveEvent, { passive: false });
    document.addEventListener('touchend', handleTouchEndEvent, { passive: false });

    // Cleanup
    return () => {
      // Remove touch event listeners
      document.removeEventListener('touchstart', handleTouchStartEvent);
      document.removeEventListener('touchmove', handleTouchMoveEvent);
      document.removeEventListener('touchend', handleTouchEndEvent);
      // Cancel animation frame
      if (animationId) {
        cancelAnimationFrame(animationId);
      }

      // Stop camera stream
      if (source && source.domElement && source.domElement.srcObject) {
        const stream = source.domElement.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      // Dispose of renderer
      if (renderer) {
        renderer.dispose();
      }      // Remove the renderer element from document.body
      const rendererElements = document.querySelectorAll("canvas");
      rendererElements.forEach((canvas) => {
        if (canvas.parentElement === document.body) {
          document.body.removeChild(canvas);
        }
      });

      // Stop performance monitoring
      if (performanceMonitorRef.current) {
        performanceMonitorRef.current.stopMonitoring();
      }

      // Remove video elements that might be created by AR
      const videoElements = document.querySelectorAll("video");
      videoElements.forEach((video) => {
        if (video.parentElement === document.body) {
          video.srcObject = null;
          document.body.removeChild(video);
        }
      });
    };
  }, [organ]);
  // Initialize heart animation controller
  useEffect(() => {
    // Only initialize for heart models
    if (organ?.id !== 'heart') return;
    
    // Wait until model is loaded before initializing
    if (!organModelRef.current) {
      console.log('❌ Heart model not yet loaded, waiting before initializing animation controller');
      return;
    }

    console.log('🫀 Initializing heart animation controller');
    
    // Clean up any existing controller first
    if (heartAnimationControllerRef.current) {
      console.log('♻️ Cleaning up existing heart animation controller');
      heartAnimationControllerRef.current.destroy();
      heartAnimationControllerRef.current = null;
    }
    
    heartAnimationControllerRef.current = new HeartAnimationController({
      // Custom config can be passed here if needed
    }, {
      onSliceStart: () => {
        console.log('🔪 Heart slicing animation started');
        setIsHeartSlicing(true);
      },
      onSliceComplete: (isSliced) => {
        console.log(`Heart slicing animation completed. Sliced: ${isSliced}`);
        setIsHeartSlicing(false);
        setIsHeartSliced(isSliced);
      },
      onLabelShow: (partId) => {
        console.log(`Label shown for heart part: ${partId}`);
      }
    });
    
    // Initialize with the model
    heartAnimationControllerRef.current.initializeHeartModel(organModelRef.current);
    
    // Apply current zoom level
    if (zoomControllerRef.current) {
      const currentZoom = zoomControllerRef.current.getCurrentZoom();
      heartAnimationControllerRef.current.handleZoomChange(currentZoom);
    }

    console.log('✅ Heart animation controller initialized successfully');

    return () => {
      console.log('Cleaning up heart animation controller');
      if (heartAnimationControllerRef.current) {
        heartAnimationControllerRef.current.destroy();
        heartAnimationControllerRef.current = null;
      }
    };
  }, [organ?.id, organModelRef.current]);

  // Handle page visibility changes to conserve resources
  useEffect(() => {
    if (organ?.id !== 'heart' || !heartAnimationControllerRef.current) return;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📱 Page hidden, pausing heart animations to save resources');
        heartAnimationControllerRef.current?.pauseAnimations();
      } else {
        console.log('📱 Page visible again, resuming heart animations');
        heartAnimationControllerRef.current?.resumeAnimations();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [organ?.id, heartAnimationControllerRef.current]);

  // Handle device orientation changes
  useEffect(() => {
    if (organ?.id !== 'heart' || !heartAnimationControllerRef.current) return;
    
    const handleResize = () => {
      console.log('📱 Window resized or orientation changed');
      heartAnimationControllerRef.current?.handleOrientationChange();
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [organ?.id, heartAnimationControllerRef.current]);

  // Initialize performance monitor
  useEffect(() => {
    performanceMonitorRef.current = new PerformanceMonitor();
    
    // Check for development mode or debug URL param
    const isDebugMode = process.env.NODE_ENV === 'development' || searchParams.get('debug') === 'true';
    
    if (isDebugMode) {
      console.log('🔍 Performance monitoring enabled in debug mode');
      performanceMonitorRef.current.startMonitoring(showPerformanceMonitor);
    }
    
    return () => {
      performanceMonitorRef.current?.stopMonitoring();
      performanceMonitorRef.current = null;
    };
  }, [showPerformanceMonitor, searchParams]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        margin: "0px",
        overflow: "hidden",
        fontFamily: "Monospace",
      }}
    >
      {/* Text overlay - EXACT same style as cutout example */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          right: "10px",
          zIndex: 100,
        }}
      >
        {" "}        <div>
          AR Scanner for <strong>{organ.name}</strong> - Point your camera at
          the Hiro marker
        </div>
        {organ.id === 'heart' && isHeartSliced && (
          <div
            style={{
              backgroundColor: "rgba(255, 0, 89, 0.8)",
              padding: "8px",
              marginTop: "10px",
              borderRadius: "4px",
              color: "white",
              fontWeight: "bold",
            }}
          >
            🔪 Heart Sliced Mode - Showing Internal Chambers
          </div>
        )}
        {organ.id === 'heart' && isHeartSlicing && (
          <div
            style={{
              backgroundColor: "rgba(255, 123, 0, 0.8)",
              padding: "8px",
              marginTop: "10px",
              borderRadius: "4px",
              color: "white",
            }}
          >
            ✂️ Slicing heart chambers...
          </div>
        )}
        {modelLoading && (
          <div
            style={{
              backgroundColor: "rgba(0, 123, 255, 0.8)",
              padding: "8px",
              marginTop: "10px",
              borderRadius: "4px",
              color: "white",
            }}
          >
            🔄 Loading {organ.name} 3D model...
          </div>
        )}
        {modelError && (
          <div
            style={{
              backgroundColor: "rgba(255, 193, 7, 0.8)",
              padding: "8px",
              marginTop: "10px",
              borderRadius: "4px",
              color: "black",
            }}
          >
            ⚠️ Model loading failed - showing fallback cube
          </div>
        )}
        <div
          id="button"
          style={{
            backgroundColor: "rgba(201, 76, 76, 0.3)",
            padding: "8px",
            marginTop: "10px",
            cursor: "pointer",
          }}
          onClick={() => navigate(-1)}
        >
          ← Back to Menu [{organ.name} 3D Model]        
        </div>
          {/* Debug buttons for heart slicing - will be removed in production */}
        {organ?.id === 'heart' && !modelLoading && !modelError && (
          <>
            <div
              style={{
                backgroundColor: isHeartSliced ? "rgba(0, 150, 136, 0.7)" : "rgba(33, 150, 243, 0.7)",
                padding: "8px",
                marginTop: "10px",
                cursor: "pointer",
                borderRadius: "4px",
                textAlign: "center",
                fontWeight: "bold",
                color: "white"
              }}
              onClick={() => {
                if (heartAnimationControllerRef.current) {
                  if (isHeartSliced) {
                    heartAnimationControllerRef.current.forceReassemble();
                  } else {
                    heartAnimationControllerRef.current.forceSlice();
                  }
                }
              }}
            >
              {isHeartSliced ? "🔄 Reassemble Heart" : "🔪 Force Slice Heart"}
            </div>
            
            <div
              style={{
                backgroundColor: "rgba(255, 152, 0, 0.7)",
                padding: "8px",
                marginTop: "10px",
                cursor: "pointer",
                borderRadius: "4px",
                textAlign: "center",
                fontWeight: "bold",
                color: "white"
              }}
              onClick={() => {
                if (heartAnimationControllerRef.current) {
                  heartAnimationControllerRef.current.debugHeartModel();
                }
              }}
            >
              🔍 Debug Heart Model
            </div>
          </>
        )}
        {/* Performance monitoring toggle - DEBUG ONLY */}
        {organ?.id === 'heart' && (
          <div
            style={{
              backgroundColor: "rgba(75, 0, 130, 0.7)",
              padding: "8px",
              marginTop: "10px",
              cursor: "pointer",
              borderRadius: "4px",
              textAlign: "center",
              fontWeight: "bold",
              color: "white"
            }}
            onClick={() => {
              setShowPerformanceMonitor(prev => {
                const newValue = !prev;
                if (performanceMonitorRef.current) {
                  if (newValue) {
                    performanceMonitorRef.current.startMonitoring(true);
                  } else {
                    performanceMonitorRef.current.stopMonitoring();
                    performanceMonitorRef.current.startMonitoring(false);
                  }
                }
                return newValue;
              });
            }}
          >
            {showPerformanceMonitor ? "📊 Hide Performance Stats" : "📊 Show Performance Stats"}
          </div>
        )}
      </div>

      {/* Zoom Controls */}
      <ARControls
        currentZoom={currentZoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        isAnimating={isZoomAnimating}
        disabled={modelLoading || modelError}
      />

      {/* AR container - attached to body like cutout example */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
        }}
      />
    </div>
  );
};

export default ARScannerPage;
