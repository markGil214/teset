import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { organs } from "../components/organData";
import { ZoomController } from "../../utils/ZoomController";
import ARControls from "../components/ARControls";
import ConfirmationDialog from "../components/ConfirmationDialog";
import ARLabel from "../components/ARLabel";
import AudioNarration from "../components/AudioNarration";
import EducationalOverlay from "../components/EducationalOverlay";
import AdvancedModes from "../components/AdvancedModes";
import PerformanceMonitor from "../components/PerformanceMonitor";
import HelpGuide from "../components/HelpGuide";
import { anatomicalData, Language, AnatomicalPart } from "../data/anatomicalData";

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
  const [showSlicedModel, setShowSlicedModel] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // AR Labels state
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [showLabels, setShowLabels] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [showEducationalOverlay, setShowEducationalOverlay] = useState(false);
  const [cutawayEnabled, setCutawayEnabled] = useState(false);
  const [xrayEnabled, setXrayEnabled] = useState(false);
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, z: 5 });
  const [modelPosition, setModelPosition] = useState({ x: 0, y: 0, z: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  
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
  // Initialize zoom controller
  useEffect(() => {
    const baseScale = getBaseScale(organ.id);
    baseScaleRef.current = baseScale;
    console.log(
      `Initializing zoom controller for ${organ.name} with base scale ${baseScale}`
    );

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
      },          onThresholdCrossed: (threshold: string, zoom: number) => {
            console.log(
              `ARScannerPage: Zoom threshold crossed: ${threshold} at ${zoom}x`
            );
            
            // Show labels when zooming in beyond 2x
            if (threshold === 'medium' && zoom >= 2.0 && !showLabels) {
              console.log("Activating AR labels at medium zoom level");
              setShowLabels(true);
            }
            
            // Hide labels when zooming out below 2x
            if (zoom < 2.0 && showLabels) {
              console.log("Deactivating AR labels below medium zoom level");
              setShowLabels(false);
              setSelectedPartId(null);
            }
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
  }, [organ.id, getBaseScale]); // Zoom control handlers
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

  // AR Label control handlers
  const handleToggleLabels = useCallback(() => {
    setShowLabels(!showLabels);
    if (!showLabels) {
      setSelectedPartId(null);
    }
    console.log(`AR Labels ${!showLabels ? 'enabled' : 'disabled'}`);
  }, [showLabels]);

  const handleToggleLanguage = useCallback(() => {
    const newLanguage = currentLanguage === 'en' ? 'fil' : 'en';
    setCurrentLanguage(newLanguage);
    console.log(`Language switched to: ${newLanguage}`);
  }, [currentLanguage]);

  const handleTogglePartDetails = useCallback((partId: string) => {
    setSelectedPartId(selectedPartId === partId ? null : partId);
    console.log(`Part details toggled for: ${partId}`);
  }, [selectedPartId]);

  const handleToggleEducationalOverlay = useCallback(() => {
    setShowEducationalOverlay(!showEducationalOverlay);
    console.log(`Educational overlay ${!showEducationalOverlay ? 'opened' : 'closed'}`);
  }, [showEducationalOverlay]);

  const handleToggleHelpGuide = useCallback(() => {
    setShowHelpGuide(!showHelpGuide);
    console.log(`Help guide ${!showHelpGuide ? 'opened' : 'closed'}`);
  }, [showHelpGuide]);

  // Advanced modes handlers
  const handleCutawayToggle = useCallback((enabled: boolean) => {
    setCutawayEnabled(enabled);
    console.log(`Cutaway mode ${enabled ? 'enabled' : 'disabled'}`);
    
    // Apply cutaway effect to 3D model
    if (organModelRef.current) {
      organModelRef.current.traverse((child: any) => {
        if (child.isMesh) {
          if (enabled) {
            // Enable cutaway effect
            child.material.side = window.THREE.DoubleSide;
            child.material.transparent = true;
            child.material.opacity = 0.7;
            child.material.needsUpdate = true;
          } else {
            // Disable cutaway effect
            child.material.side = window.THREE.FrontSide;
            child.material.transparent = false;
            child.material.opacity = 1.0;
            child.material.needsUpdate = true;
          }
        }
      });
    }
  }, []);

  const handleXrayToggle = useCallback((enabled: boolean) => {
    setXrayEnabled(enabled);
    console.log(`X-ray mode ${enabled ? 'enabled' : 'disabled'}`);
    
    // Apply x-ray effect to 3D model
    if (organModelRef.current) {
      organModelRef.current.traverse((child: any) => {
        if (child.isMesh) {
          if (enabled) {
            // Enable x-ray effect
            child.material.transparent = true;
            child.material.opacity = 0.3;
            child.material.wireframe = true;
            child.material.needsUpdate = true;
          } else {
            // Disable x-ray effect
            child.material.transparent = false;
            child.material.opacity = 1.0;
            child.material.wireframe = false;
            child.material.needsUpdate = true;
          }
        }
      });
    }
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
          target.closest("[data-ui-element]"))
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
          target.closest("[data-ui-element]"))
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

  useEffect(() => {
    if (!containerRef.current) return;

    let animationId: number;
    let renderer: any;
    let source: any;

    // EXACT COPY-CAT of basic-cutout.html script section
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
    
    // Update canvas size for AR labels
    setCanvasSize({ width: window.innerWidth, height: window.innerHeight }); // init scene and camera - EXACT SAME AS BASIC.HTML
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
        controller.update(source.domElement);
        
        // Update camera and model positions for AR labels
        if (showLabels && camera && markerGroup) {
          setCameraPosition({
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z
          });
          
          setModelPosition({
            x: markerGroup.position.x,
            y: markerGroup.position.y,
            z: markerGroup.position.z
          });
        }

        // Rotate the 3D model if it's loaded (but not for sliced heart model)
        if ((markerGroup as any).organModel) {
          // Only rotate if it's not the sliced heart model
          if (!showSlicedModelRef.current) {
            (markerGroup as any).organModel.rotation.y +=
              (deltaMsec / 2000) * Math.PI;
          }
        }

        renderer.render(scene, camera);
      }
      animationId = requestAnimationFrame(animate);
    });

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

    // Cleanup
    return () => {
      // Remove touch event listeners
      document.removeEventListener("touchstart", handleTouchStartEvent);
      document.removeEventListener("touchmove", handleTouchMoveEvent);
      document.removeEventListener("touchend", handleTouchEndEvent);
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
  }, [organ]);

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
    console.log("User confirmed to view sliced heart model");
    setShowConfirmation(false);
    setShowSlicedModel(true);
    showSlicedModelRef.current = true;
  }, []);

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

      {/* Educational Controls - Only show when zoom >= 2x */}
      {currentZoom >= 2.0 && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 200,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {/* Language Toggle */}
          <button
            onClick={handleToggleLanguage}
            data-ui-element="true"
            style={{
              backgroundColor: "rgba(33, 150, 243, 0.9)",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {currentLanguage === 'en' ? 'EN' : 'FIL'}
          </button>

          {/* Labels Toggle */}
          <button
            onClick={handleToggleLabels}
            data-ui-element="true"
            style={{
              backgroundColor: showLabels 
                ? "rgba(76, 175, 80, 0.9)" 
                : "rgba(158, 158, 158, 0.9)",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {showLabels ? "🏷️ ON" : "🏷️ OFF"}
          </button>

          {/* Educational Overlay Toggle - Only show when zoom >= 3x */}
          {currentZoom >= 3.0 && (
            <button
              onClick={handleToggleEducationalOverlay}
              data-ui-element="true"
              style={{
                backgroundColor: showEducationalOverlay 
                  ? "rgba(156, 39, 176, 0.9)" 
                  : "rgba(96, 125, 139, 0.9)",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {showEducationalOverlay ? "📚 CLOSE" : "📚 LEARN"}
            </button>
          )}
        </div>
      )}

      {/* AR Labels */}
      {showLabels && anatomicalData[organ.id] && (
        <>
          {anatomicalData[organ.id].parts.map((part: AnatomicalPart) => (
            <ARLabel
              key={part.id}
              part={part}
              language={currentLanguage}
              isVisible={showLabels}
              onToggleDetails={handleTogglePartDetails}
              showDetails={selectedPartId === part.id}
              cameraPosition={cameraPosition}
              modelPosition={modelPosition}
              canvasWidth={canvasSize.width}
              canvasHeight={canvasSize.height}
            />
          ))}
        </>
      )}

      {/* Audio Narration */}
      <AudioNarration
        organId={organ.id}
        language={currentLanguage}
        isVisible={currentZoom >= 2.0}
        currentZoom={currentZoom}
      />

      {/* Educational Overlay */}
      <EducationalOverlay
        organId={organ.id}
        language={currentLanguage}
        isVisible={showEducationalOverlay}
        currentZoom={currentZoom}
        onClose={() => setShowEducationalOverlay(false)}
      />

      {/* Advanced Interaction Modes */}
      <AdvancedModes
        organId={organ.id}
        language={currentLanguage}
        isVisible={currentZoom >= 4.0}
        currentZoom={currentZoom}
        onCutawayToggle={handleCutawayToggle}
        onXrayToggle={handleXrayToggle}
        cutawayEnabled={cutawayEnabled}
        xrayEnabled={xrayEnabled}
      />

      {/* Performance Monitor */}
      <PerformanceMonitor
        isVisible={true}
        isDevelopment={process.env.NODE_ENV === 'development'}
      />

      {/* Help Guide */}
      <HelpGuide
        isVisible={showHelpGuide}
        language={currentLanguage}
        onClose={() => setShowHelpGuide(false)}
      />

      {/* Floating Help Button */}
      <button
        onClick={handleToggleHelpGuide}
        data-ui-element="true"
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          backgroundColor: "rgba(33, 150, 243, 0.9)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "48px",
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(33, 150, 243, 1)";
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(33, 150, 243, 0.9)";
          e.currentTarget.style.transform = "scale(1)";
        }}
        title={currentLanguage === 'en' ? 'Help & Guide' : 'Tulong at Gabay'}
      >
        ❓
      </button>

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
