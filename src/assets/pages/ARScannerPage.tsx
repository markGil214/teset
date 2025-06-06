import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { organs } from "../components/organData";
import { ZoomController } from "../../utils/ZoomController";
import ARControls from "../components/ARControls";
import ConfirmationDialog from "../components/ConfirmationDialog";

// Declare global variables for the libraries
declare global {
  interface Window {
    THREE: any;
    THREEAR: any;
  }
}

const ARScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedOrganId, setSelectedOrganId] = useState<string>("heart"); // Default to heart
  const organ = organs.find((o) => o.id === selectedOrganId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelError, setModelError] = useState(false);
  const [cameraInitialized, setCameraInitialized] = useState(false);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const sourceRef = useRef<any>(null);
  const controllerRef = useRef<any>(null);

  // Zoom state
  const [currentZoom, setCurrentZoom] = useState(1.0);
  const [isZoomAnimating, setIsZoomAnimating] = useState(false);
  const [showMaxZoomMessage, setShowMaxZoomMessage] = useState(false);
  const [showSlicedModel, setShowSlicedModel] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const showSlicedModelRef = useRef(false);
  const zoomControllerRef = useRef<ZoomController | null>(null);
  const organModelRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);
  const baseScaleRef = useRef<number>(0.5);
  const originalModelRef = useRef<any>(null);

  if (!organ) {
    return <div>Organ not found</div>;
  }
  // Get base scale for organ type
  const getBaseScale = useCallback((organId: string): number => {
    switch (organId) {
      case "brain":
        return 0.3;
      case "heart":
        return 0.8;
      case "kidney":
        return 0.4;
      case "lungs":
        return 0.6;
      case "skin":
        return 0.5;
      default:
        return 0.5;
    }
  }, []);
  // Initialize zoom controller - reinitialize when organ changes
  useEffect(() => {
    if (!organ) return;
    
    const baseScale = getBaseScale(organ.id);
    baseScaleRef.current = baseScale;
    console.log(
      `Initializing zoom controller for ${organ.name} with base scale ${baseScale}`
    );

    // Destroy previous controller if it exists
    if (zoomControllerRef.current) {
      zoomControllerRef.current.destroy();
    }

    zoomControllerRef.current = new ZoomController(1.0, {
      onZoomChange: (zoom: number) => {
        console.log(`ARScannerPage: Zoom changed to: ${zoom}x`);
        setCurrentZoom(zoom);

        // Check if we should switch back to original model when zooming out
        if (showSlicedModel && zoom < 3.0 && organ.id === "heart") {
          console.log(
            "Zoom reduced below max - switching back to original model"
          );
          restoreOriginalModel();
          setShowSlicedModel(false);
          showSlicedModelRef.current = false;
        }

        // Apply zoom to the 3D model
        if (organModelRef.current) {
          const newScale = baseScaleRef.current * zoom;
          console.log(
            `ARScannerPage: Applying scale: ${newScale} (base: ${baseScaleRef.current}, zoom: ${zoom})`
          );
          organModelRef.current.scale.set(newScale, newScale, newScale);
        } else {
          console.log(
            "ARScannerPage: Model not loaded yet - will apply zoom when loaded"
          );
        }
      },
      onThresholdCrossed: (threshold: string, zoom: number) => {
        console.log(
          `ARScannerPage: Zoom threshold crossed: ${threshold} at ${zoom}x`
        );
        // Future: Handle threshold crossings for slicing, labels, etc.
      },
      onMaxZoomReached: () => {
        if (organ.id === "heart") {
          console.log(
            "ARScannerPage: Max zoom reached - showing sliced heart confirmation"
          );
          setShowConfirmation(true);

          // Hide the original model when showing the confirmation dialog
          if (organModelRef.current && markerGroupRef.current) {
            // Store the current model before hiding it
            originalModelRef.current = organModelRef.current;
            // Hide the model
            markerGroupRef.current.remove(organModelRef.current);
          }
        } else {
          console.log("ARScannerPage: Max zoom reached - showing message");
          setShowMaxZoomMessage(true);
        }
      },
    });

    console.log("Zoom controller initialized successfully");

    return () => {
      console.log("Cleaning up zoom controller");
      zoomControllerRef.current?.destroy();
    };
  }, [organ?.id, getBaseScale, selectedOrganId]); // Zoom control handlers
  const handleZoomIn = useCallback(() => {
    console.log("=== ARScannerPage: Zoom In button clicked ===");
    console.log("ZoomController exists:", !!zoomControllerRef.current);
    console.log("Model exists:", !!organModelRef.current);
    if (zoomControllerRef.current) {
      console.log(
        "Current zoom before zoomIn:",
        zoomControllerRef.current.getCurrentZoom()
      );
      zoomControllerRef.current.zoomIn();
    } else {
      console.error("ZoomController not initialized!");
    }
    setIsZoomAnimating(true);
    setTimeout(() => setIsZoomAnimating(false), 300);
  }, []);

  const handleZoomOut = useCallback(() => {
    console.log("=== ARScannerPage: Zoom Out button clicked ===");
    console.log("ZoomController exists:", !!zoomControllerRef.current);
    console.log("Model exists:", !!organModelRef.current);
    if (zoomControllerRef.current) {
      console.log(
        "Current zoom before zoomOut:",
        zoomControllerRef.current.getCurrentZoom()
      );
      zoomControllerRef.current.zoomOut();
    } else {
      console.error("ZoomController not initialized!");
    }
    setIsZoomAnimating(true);
    setTimeout(() => setIsZoomAnimating(false), 300);
  }, []);

  const handleResetZoom = useCallback(() => {
    console.log("=== ARScannerPage: Reset Zoom button clicked ===");
    console.log("ZoomController exists:", !!zoomControllerRef.current);
    console.log("Model exists:", !!organModelRef.current);
    if (zoomControllerRef.current) {
      console.log(
        "Current zoom before reset:",
        zoomControllerRef.current.getCurrentZoom()
      );
      zoomControllerRef.current.resetZoom();
    } else {
      console.error("ZoomController not initialized!");
    }
    setIsZoomAnimating(true);
    setTimeout(() => setIsZoomAnimating(false), 300);
  }, []);

  // Touch gesture handlers - Following PHASE3 pattern for UI element detection
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      // Don't handle touch events if confirmation dialog is shown
      if (showConfirmation) {
        return;
      }

      // Check if the touch started on a UI button or interactive element
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.closest("button") ||
          target.hasAttribute("data-ui-element") ||
          target.closest("[data-ui-element]") ||
          target.hasAttribute("data-organ-button") ||
          target.closest("[data-organ-button]") ||
          target.style.cursor === "pointer" ||
          target.closest('[style*="cursor: pointer"]'))
      ) {
        // Don't prevent default for UI elements - let them handle their own events
        console.log("Touch on UI element detected, skipping zoom handler");
        return;
      }

      zoomControllerRef.current?.handleTouchStart(e);
    },
    [showConfirmation]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      // Don't handle touch events if confirmation dialog is shown
      if (showConfirmation) {
        return;
      }

      // Check if touch is on UI element
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.closest("button") ||
          target.hasAttribute("data-ui-element") ||
          target.closest("[data-ui-element]") ||
          target.hasAttribute("data-organ-button") ||
          target.closest("[data-organ-button]"))
      ) {
        return;
      }

      zoomControllerRef.current?.handleTouchMove(e);
    },
    [showConfirmation]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      // Don't handle touch events if confirmation dialog is shown
      if (showConfirmation) {
        return;
      }

      // Check if touch is on UI element
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.closest("button") ||
          target.hasAttribute("data-ui-element") ||
          target.closest("[data-ui-element]") ||
          target.hasAttribute("data-organ-button") ||
          target.closest("[data-organ-button]"))
      ) {
        return;
      }

      zoomControllerRef.current?.handleTouchEnd(e);
    },
    [showConfirmation]
  );

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

  // Initialize the camera and AR scene only once
  useEffect(() => {
    if (!containerRef.current || cameraInitialized) return;

    console.log("Initializing camera and AR scene");

    // EXACT COPY-CAT of basic-cutout.html script section
    const renderer = new window.THREE.WebGLRenderer({
      alpha: true,
    });
    renderer.setClearColor(new window.THREE.Color("lightgrey"), 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0px";
    renderer.domElement.style.left = "0px";
    document.body.appendChild(renderer.domElement); 
    
    // Initialize scene and camera
    const scene = new window.THREE.Scene();
    const camera = new window.THREE.Camera();
    scene.add(camera);
    const markerGroup = new window.THREE.Group();
    scene.add(markerGroup);

    // Save references
    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    markerGroupRef.current = markerGroup;

    // Set camera as initialized
    setCameraInitialized(true);
  }, []);

  // Function to start the animation loop
  const startAnimationLoop = useCallback(() => {
    if (!controllerRef.current || !sourceRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    console.log("Starting animation loop");
    
    const controller = controllerRef.current;
    const source = sourceRef.current;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    
    let animationId: number;
    let lastTimeMsec = 0;
    
    function animate(nowMsec: number) {
      // keep looping
      animationId = requestAnimationFrame(animate);
      // measure time
      lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
      var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
      lastTimeMsec = nowMsec;
      // call each update function
      controller.update(source.domElement);
      
      // Rotate the 3D model if it's loaded (but not for sliced heart model)
      if (markerGroupRef.current && (markerGroupRef.current as any).organModel) {
        // Only rotate if it's not the sliced heart model
        if (!showSlicedModelRef.current) {
          (markerGroupRef.current as any).organModel.rotation.y +=
            (deltaMsec / 2000) * Math.PI;
        }
      }

      renderer.render(scene, camera);
    }
    
    animationId = requestAnimationFrame(animate);
    return animationId;
  }, []);

  // Initialize the AR source and controller only once
  useEffect(() => {
    if (!cameraInitialized || !rendererRef.current || !cameraRef.current || sourceRef.current) return;

    console.log("Initializing AR source and controller");

    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;

    // Initialize AR source
    const source = new window.THREEAR.Source({ renderer, camera });
    sourceRef.current = source;

    // Initialize AR controller
    window.THREEAR.initialize({ source: source }).then((controller: any) => {
      controllerRef.current = controller;

      // Add lighting for better 3D model visibility
      var ambientLight = new window.THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      var directionalLight = new window.THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      // Setup marker tracking
      var patternMarker = new window.THREEAR.PatternMarker({
        patternUrl: "/data/patt.hiro",
        markerObject: markerGroupRef.current,
      });
      controller.trackMarker(patternMarker);

      // Start animation loop
      startAnimationLoop();
    });
  }, [cameraInitialized, startAnimationLoop]);

  // Load the organ model whenever the selected organ changes
  useEffect(() => {
    if (!organ || !cameraInitialized || !markerGroupRef.current) return;

    console.log(`Loading model for ${organ.name}`);
    setModelLoading(true);
    setModelError(false);

    // Remove any existing model
    if (organModelRef.current) {
      markerGroupRef.current.remove(organModelRef.current);
      organModelRef.current = null;
    }

    // Load the 3D model for the selected organ
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
        
        // Store the base scale for this organ
        baseScaleRef.current = scale;
        
        model.scale.set(scale, scale, scale);
        model.position.y = positionY;
        markerGroupRef.current.add(model);

        // Store model reference for zoom control
        organModelRef.current = model;
        (markerGroupRef.current as any).organModel = model;

          // Apply current zoom level to the newly loaded model
          if (zoomControllerRef.current) {
            const currentZoomLevel = zoomControllerRef.current.getCurrentZoom();
            if (currentZoomLevel !== 1.0) {
              const newScale = scale * currentZoomLevel;
              console.log(
                `Applying initial zoom ${currentZoomLevel}x to loaded model: scale ${newScale}`
              );
              model.scale.set(newScale, newScale, newScale);
            }
          }

          // Model loaded successfully
          setModelLoading(false);
          console.log(
            `${organ.name} 3D model loaded successfully with scale: ${scale}`
          );
          
          // When changing organs, reset sliced model state
          if (showSlicedModel && organ.id !== "heart") {
            setShowSlicedModel(false);
            showSlicedModelRef.current = false;
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
          markerGroupRef.current.add(cube);
        }
      );
  }, [organ, selectedOrganId, cameraInitialized, showSlicedModel]);
  
  // Cleanup function and add event listeners when component mounts
  useEffect(() => {
    // Add touch event listeners for pinch-to-zoom
    const handleTouchStartEvent = (e: TouchEvent) => handleTouchStart(e);
    const handleTouchMoveEvent = (e: TouchEvent) => handleTouchMove(e);
    const handleTouchEndEvent = (e: TouchEvent) => handleTouchEnd(e);

    document.addEventListener("touchstart", handleTouchStartEvent, {
      passive: false,
    });
    document.addEventListener("touchmove", handleTouchMoveEvent, {
      passive: false,
    });
    document.addEventListener("touchend", handleTouchEndEvent, {
      passive: false,
    });

    // Cleanup function when component unmounts
    return () => {
      console.log("Cleaning up AR resources");
      
      // Remove touch event listeners
      document.removeEventListener("touchstart", handleTouchStartEvent);
      document.removeEventListener("touchmove", handleTouchMoveEvent);
      document.removeEventListener("touchend", handleTouchEndEvent);
      
      // Stop camera stream
      if (sourceRef.current && sourceRef.current.domElement && sourceRef.current.domElement.srcObject) {
        const stream = sourceRef.current.domElement.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      // Dispose of renderer
      if (rendererRef.current) {
        rendererRef.current.dispose();
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
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Function to load sliced heart model
  const loadSlicedHeartModel = useCallback(() => {
    if (!markerGroupRef.current || !organModelRef.current) return;

    console.log("Loading sliced heart model...");

    // Store reference to original model
    originalModelRef.current = organModelRef.current;

    // Remove current model from scene
    markerGroupRef.current.remove(organModelRef.current);

    // Load sliced heart model
    const gltfLoader = new window.THREE.GLTFLoader();
    gltfLoader.load(
      "/sliced_organs/heart.glb",
      (gltf: any) => {
        const slicedModel = gltf.scene;

        // Apply same scale and position as heart
        const scale = 0.8;
        const currentZoomLevel =
          zoomControllerRef.current?.getCurrentZoom() || 1.0;
        const finalScale = scale * currentZoomLevel;

        slicedModel.scale.set(finalScale, finalScale, finalScale);
        slicedModel.position.y = 0;

        // Add sliced model to scene
        markerGroupRef.current.add(slicedModel);

        // Update model reference
        organModelRef.current = slicedModel;
        (markerGroupRef.current as any).organModel = slicedModel;

        console.log("Sliced heart model loaded successfully");
      },
      undefined,
      (error: any) => {
        console.error("Error loading sliced heart model:", error);
        // Fallback: keep original model
        if (originalModelRef.current) {
          markerGroupRef.current.add(originalModelRef.current);
          organModelRef.current = originalModelRef.current;
        }
      }
    );
  }, []);

  // Function to restore original model
  const restoreOriginalModel = useCallback(() => {
    if (!markerGroupRef.current || !originalModelRef.current) return;

    console.log("Restoring original heart model...");

    // Remove current sliced model from scene
    if (organModelRef.current) {
      markerGroupRef.current.remove(organModelRef.current);
    }

    // Add original model back to scene
    markerGroupRef.current.add(originalModelRef.current);

    // Update model reference
    organModelRef.current = originalModelRef.current;
    (markerGroupRef.current as any).organModel = originalModelRef.current;

    console.log("Original heart model restored successfully");
  }, []);

  useEffect(() => {
    if (showSlicedModel) {
      loadSlicedHeartModel();
    }
  }, [showSlicedModel, loadSlicedHeartModel]);

  // Handle confirmation dialog actions
  const handleConfirmViewSlicedHeart = useCallback(() => {
    console.log("User confirmed to view sliced heart model - navigating to SlicedHeartPage");
    setShowConfirmation(false);
    
    // Navigate to the new SlicedHeartPage instead of switching models in AR
    navigate('/sliced-heart');
  }, [navigate]);

  const handleCancelViewSlicedHeart = useCallback(() => {
    console.log("User cancelled viewing sliced heart model");
    setShowConfirmation(false);
    // Zoom out slightly to prevent triggering the max zoom again immediately
    if (zoomControllerRef.current) {
      zoomControllerRef.current.zoomOut();
    }

    // Restore the original model
    if (originalModelRef.current && markerGroupRef.current) {
      markerGroupRef.current.add(originalModelRef.current);
      organModelRef.current = originalModelRef.current;
      (markerGroupRef.current as any).organModel = originalModelRef.current;
      console.log("Original model restored after cancellation");
    }
  }, []);

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
        {" "}
        <div>
          AR Scanner for <strong>{organ.name}</strong> - Point your camera at
          the Hiro marker
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
        <div
          id="button"
          data-ui-element="true"
          style={{
            backgroundColor: "rgba(201, 76, 76, 0.3)",
            padding: "8px",
            marginTop: "10px",
            cursor: "pointer",
            pointerEvents: "auto",
            position: "relative",
            zIndex: 100,
          }}
          onClick={() => navigate(-1)}
        >
          ← Back to Menu [{organ.name} 3D Model]{" "}
        </div>
      </div>
      
      {/* Organ Selection Buttons (exactly like the image provided) */}
      <div
        style={{
          position: "absolute",
          bottom: "100px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          zIndex: 200,
        }}
      >
        <button
          data-organ-button="true"
          data-ui-element="true"
          onClick={() => setSelectedOrganId("heart")}
          style={{
            width: "80px",
            padding: "10px",
            borderRadius: "5px",
            border: selectedOrganId === "heart" ? "2px solid white" : "1px solid rgba(255,255,255,0.4)",
            backgroundColor: selectedOrganId === "heart" ? "rgba(255,255,255,0.9)" : "rgba(100,100,100,0.7)",
            color: selectedOrganId === "heart" ? "#000" : "#fff",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Heart
        </button>
        
        <button
          data-organ-button="true"
          data-ui-element="true"
          onClick={() => setSelectedOrganId("brain")}
          style={{
            width: "80px",
            padding: "10px",
            borderRadius: "5px",
            border: selectedOrganId === "brain" ? "2px solid white" : "1px solid rgba(255,255,255,0.4)",
            backgroundColor: selectedOrganId === "brain" ? "rgba(255,255,255,0.9)" : "rgba(100,100,100,0.7)",
            color: selectedOrganId === "brain" ? "#000" : "#fff",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Default
        </button>
        
        <button
          data-organ-button="true"
          data-ui-element="true"
          onClick={() => setSelectedOrganId("lungs")}
          style={{
            width: "80px",
            padding: "10px",
            borderRadius: "5px",
            border: selectedOrganId === "lungs" ? "2px solid white" : "1px solid rgba(255,255,255,0.4)",
            backgroundColor: selectedOrganId === "lungs" ? "rgba(255,255,255,0.9)" : "rgba(100,100,100,0.7)",
            color: selectedOrganId === "lungs" ? "#000" : "#fff",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Lungs
        </button>
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
        showSlicedModel={showSlicedModel}
        organId={organ.id}
        onMaxZoomMessageShown={() => setShowMaxZoomMessage(false)}
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

      {/* Portal-based Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        onConfirm={handleConfirmViewSlicedHeart}
        onCancel={handleCancelViewSlicedHeart}
      />
    </div>
  );
};

export default ARScannerPage;
