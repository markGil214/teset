// ARScannerPage.tsx - Clean version with sliced heart functionality
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { organs } from "../components/organData";
import { ZoomController } from "../../utils/ZoomController";
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
  const [showMaxZoomMessage, setShowMaxZoomMessage] = useState(false);
  const [isSlicedModel, setIsSlicedModel] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const zoomControllerRef = useRef<ZoomController | null>(null);
  const organModelRef = useRef<any>(null);
  const slicedModelRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);
  const baseScaleRef = useRef<number>(0.5);

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

  // Load sliced model function
  const loadSlicedModel = useCallback((markerGroup: any, originalScale: number, positionY: number) => {
    if (organ.id !== 'heart') return; // Only heart has sliced model for now
    
    console.log('Loading sliced heart model...');
    setIsTransitioning(true);
    
    const gltfLoader = new window.THREE.GLTFLoader();
    gltfLoader.load(
      '/sliced_organs/heart.glb',
      (gltf: any) => {
        const slicedModel = gltf.scene;
        
        // Apply same scale and position as original model
        slicedModel.scale.set(originalScale, originalScale, originalScale);
        slicedModel.position.y = positionY;
        
        // Store reference
        slicedModelRef.current = slicedModel;
        
        // Initially hide the sliced model
        slicedModel.visible = false;
        markerGroup.add(slicedModel);
        
        console.log('Sliced heart model loaded successfully');
        
        // Start transition animation
        transitionToSlicedModel();
      },
      undefined,
      (error: any) => {
        console.error('Error loading sliced heart model:', error);
        setIsTransitioning(false);
        // Fallback: just show message
        setShowMaxZoomMessage(true);
      }
    );
  }, [organ.id]);
  
  // Transition animation between normal and sliced model
  const transitionToSlicedModel = useCallback(() => {
    if (!organModelRef.current || !slicedModelRef.current) return;
    
    const duration = 1000; // 1 second transition
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-in-out function
      const easeInOut = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      // Fade out original model
      if (organModelRef.current) {
        organModelRef.current.traverse((child: any) => {
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: any) => {
                mat.transparent = true;
                mat.opacity = 1 - easeInOut;
              });
            } else {
              child.material.transparent = true;
              child.material.opacity = 1 - easeInOut;
            }
          }
        });
      }
      
      // Fade in sliced model
      if (slicedModelRef.current) {
        slicedModelRef.current.visible = true;
        slicedModelRef.current.traverse((child: any) => {
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: any) => {
                mat.transparent = true;
                mat.opacity = easeInOut;
              });
            } else {
              child.material.transparent = true;
              child.material.opacity = easeInOut;
            }
          }
        });
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Transition complete
        setIsTransitioning(false);
        setIsSlicedModel(true);
        console.log('Transition to sliced model complete');
      }
    };
    
    requestAnimationFrame(animate);
  }, []);
  
  // Transition back to normal model
  const transitionToNormalModel = useCallback(() => {
    if (!organModelRef.current || !slicedModelRef.current || !isSlicedModel) return;
    
    const duration = 800; // Faster transition back
    const startTime = Date.now();
    
    setIsTransitioning(true);
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeInOut = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      // Fade out sliced model
      if (slicedModelRef.current) {
        slicedModelRef.current.traverse((child: any) => {
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: any) => {
                mat.transparent = true;
                mat.opacity = 1 - easeInOut;
              });
            } else {
              child.material.transparent = true;
              child.material.opacity = 1 - easeInOut;
            }
          }
        });
      }
      
      // Fade in original model
      if (organModelRef.current) {
        organModelRef.current.traverse((child: any) => {
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: any) => {
                mat.transparent = true;
                mat.opacity = easeInOut;
              });
            } else {
              child.material.transparent = true;
              child.material.opacity = easeInOut;
            }
          }
        });
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Transition complete
        if (slicedModelRef.current) {
          slicedModelRef.current.visible = false;
        }
        setIsTransitioning(false);
        setIsSlicedModel(false);
        console.log('Transition to normal model complete');
      }
    };
    
    requestAnimationFrame(animate);
  }, [isSlicedModel]);

  // Initialize zoom controller
  useEffect(() => {
    const baseScale = getBaseScale(organ.id);
    baseScaleRef.current = baseScale;
    console.log(`Initializing zoom controller for ${organ.name} with base scale ${baseScale}`);

    zoomControllerRef.current = new ZoomController(1.0, {
      onZoomChange: (zoom: number) => {
        console.log(`ARScannerPage: Zoom changed to: ${zoom}x`);
        setCurrentZoom(zoom);
        // Apply zoom to the 3D model
        if (organModelRef.current) {
          const newScale = baseScaleRef.current * zoom;
          console.log(`ARScannerPage: Applying scale: ${newScale} (base: ${baseScaleRef.current}, zoom: ${zoom})`);
          organModelRef.current.scale.set(newScale, newScale, newScale);
        } else {
          console.log('ARScannerPage: Model not loaded yet - will apply zoom when loaded');
        }
      },
      onThresholdCrossed: (threshold: string, zoom: number) => {
        console.log(`ARScannerPage: Zoom threshold crossed: ${threshold} at ${zoom}x`);
        // Future: Handle threshold crossings for slicing, labels, etc.
      },
      onMaxZoomReached: () => {
        console.log("ARScannerPage: Max zoom reached - loading sliced model");
        if (organ.id === 'heart' && !isSlicedModel && !isTransitioning) {
          // Load sliced model for heart
          if (markerGroupRef.current && organModelRef.current) {
            const currentScale = organModelRef.current.scale.x;
            const positionY = organModelRef.current.position.y;
            loadSlicedModel(markerGroupRef.current, currentScale, positionY);
          }
        } else {
          // For other organs, show message
          setShowMaxZoomMessage(true);
        }
      }
    });

    console.log('Zoom controller initialized successfully');

    return () => {
      console.log('Cleaning up zoom controller');
      zoomControllerRef.current?.destroy();
    };
  }, [organ.id, getBaseScale, isSlicedModel, isTransitioning, loadSlicedModel]);

  // Zoom control handlers
  const handleZoomIn = useCallback(() => {
    console.log('=== ARScannerPage: Zoom In button clicked ===');
    if (zoomControllerRef.current) {
      zoomControllerRef.current.zoomIn();
    }
    setIsZoomAnimating(true);
    setTimeout(() => setIsZoomAnimating(false), 300);
  }, []);

  const handleZoomOut = useCallback(() => {
    console.log("=== ARScannerPage: Zoom Out button clicked ===");
    
    // If we're in sliced model state, transition back to normal
    if (isSlicedModel && !isTransitioning) {
      transitionToNormalModel();
    }
    
    if (zoomControllerRef.current) {
      zoomControllerRef.current.zoomOut();
    }
    setIsZoomAnimating(true);
    setTimeout(() => setIsZoomAnimating(false), 300);
  }, [isSlicedModel, isTransitioning, transitionToNormalModel]);

  const handleResetZoom = useCallback(() => {
    console.log("=== ARScannerPage: Reset Zoom button clicked ===");
    
    // If we're in sliced model state, transition back to normal
    if (isSlicedModel && !isTransitioning) {
      transitionToNormalModel();
    }
    
    if (zoomControllerRef.current) {
      zoomControllerRef.current.resetZoom();
    }
    setIsZoomAnimating(true);
    setTimeout(() => setIsZoomAnimating(false), 300);
  }, [isSlicedModel, isTransitioning, transitionToNormalModel]);

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
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    let animationId: number;
    let renderer: any;
    let source: any;

    // EXACT COPY-CAT of basic-cutout.html script section
    renderer = new window.THREE.WebGLRenderer({
      alpha: true,
    });
    renderer.setClearColor(new window.THREE.Color("lightgrey"), 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0px";
    renderer.domElement.style.left = "0px";
    document.body.appendChild(renderer.domElement);

    // init scene and camera - EXACT SAME AS BASIC.HTML
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
      scene.add(directionalLight);

      // Load the 3D model for this organ
      var gltfLoader = new window.THREE.GLTFLoader();
      gltfLoader.load(
        organ.modelPath,
        (gltf: any) => {
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
          }

          model.scale.set(scale, scale, scale);
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

          // Model loaded successfully
          setModelLoading(false);
          console.log(`${organ.name} 3D model loaded successfully with scale: ${scale}`);
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

      controller.trackMarker(patternMarker);

      // Use EXACT SAME animation loop as basic.html - THIS IS KEY!
      var lastTimeMsec = 0;
      function animate(nowMsec: number) {
        animationId = requestAnimationFrame(animate);
        lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
        var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
        lastTimeMsec = nowMsec;
        controller.update(source.domElement);

        // Rotate the 3D model if it's loaded
        if ((markerGroup as any).organModel) {
          (markerGroup as any).organModel.rotation.y += (deltaMsec / 2000) * Math.PI;
        }

        renderer.render(scene, camera);
      }

      animationId = requestAnimationFrame(animate);
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
      }

      // Remove the renderer element from document.body
      const rendererElements = document.querySelectorAll("canvas");
      rendererElements.forEach((canvas) => {
        if (canvas.parentElement === document.body) {
          document.body.removeChild(canvas);
        }
      });

      // Remove video elements that might be created by AR
      const videoElements = document.querySelectorAll("video");
      videoElements.forEach((video) => {
        if (video.parentElement === document.body) {
          video.srcObject = null;
          document.body.removeChild(video);
        }
      });
    };
  }, [organ, handleTouchStart, handleTouchMove, handleTouchEnd]);

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
      {/* Text overlay */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          right: "10px",
          zIndex: 100,
        }}
      >
        <div>
          AR Scanner for <strong>{organ.name}</strong> - Point your camera at the Hiro marker
        </div>
        
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
        
        {isSlicedModel && (
          <div
            style={{
              backgroundColor: "rgba(34, 139, 34, 0.8)",
              padding: "8px",
              marginTop: "10px",
              borderRadius: "4px",
              color: "white",
            }}
          >
            🔬 Viewing Sliced {organ.name} - Zoom out to return to normal view
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
      </div>

      {/* Zoom Controls */}
      <ARControls
        currentZoom={currentZoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        isAnimating={isZoomAnimating}
        disabled={modelLoading || modelError}
        showMaxZoomMessage={showMaxZoomMessage}
        onMaxZoomMessageShown={() => setShowMaxZoomMessage(false)}
      />

      {/* AR container */}
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
