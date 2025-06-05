import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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

// Heart Part Interface and Data
interface HeartPart {
  id: string;
  name: string;
  description: string;
  position: [number, number, number];
  color: string;
}

const heartParts: HeartPart[] = [
  {
    id: "1",
    name: "Aorta",
    description:
      "The main artery that carries oxygenated blood from the left ventricle to the rest of the body.",
    position: [0, 1, 0.5],
    color: "#e74c3c",
  },
  {
    id: "2",
    name: "Superior Vena Cava",
    description:
      "Large vein that carries deoxygenated blood from the upper body back to the right atrium of the heart.",
    position: [-0.5, 0.4, 0.2],
    color: "#3498db",
  },
  {
    id: "3",
    name: "Pulmonary Artery",
    description:
      "Carries deoxygenated blood from the right ventricle to the lungs for oxygenation.",
    position: [1.0, 0.3, 0.2],
    color: "#9b59b6",
  },
  {
    id: "4",
    name: "Right Atrium",
    description:
      "Upper right chamber of the heart that receives deoxygenated blood from the body via the vena cavae.",
    position: [0.2, 0.1, 0.4],
    color: "#2ecc71",
  },
  {
    id: "5",
    name: "Left Atrium",
    description:
      "Upper left chamber of the heart that receives oxygenated blood from the lungs via the pulmonary veins.",
    position: [1.2, 0.0, 0.2],
    color: "#f39c12",
  },
  {
    id: "6",
    name: "Right Ventricle",
    description:
      "Lower right chamber of the heart that pumps deoxygenated blood to the lungs through the pulmonary artery.",
    position: [0.1, -0.4, 0.4],
    color: "#8e44ad",
  },
  {
    id: "7",
    name: "Left Ventricle",
    description:
      "Lower left chamber of the heart that pumps oxygenated blood to the body through the aorta. It has the thickest muscular wall.",
    position: [1.0, -0.2, 0.2],
    color: "#c0392b",
  },
  {
    id: "8",
    name: "Inferior Vena Cava",
    description:
      "Large vein that carries deoxygenated blood from the lower body back to the right atrium of the heart.",
    position: [0.1, -0.7, 0.3],
    color: "#34495e",
  },
];

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
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  
  // Refs for 3D scene management
  const showSlicedModelRef = useRef(false);
  const zoomControllerRef = useRef<ZoomController | null>(null);
  const organModelRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);
  const baseScaleRef = useRef<number>(0.5);
  const originalModelRef = useRef<any>(null);
  
  // Refs for interactive heart labeling
  const labelGroupRef = useRef<any>(null);

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
    // Add CSS animation for heart part panel
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

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
      
      // Remove the CSS style
      const existingStyles = document.querySelectorAll('style');
      existingStyles.forEach((styleEl) => {
        if (styleEl.textContent?.includes('@keyframes slideUp')) {
          document.head.removeChild(styleEl);
        }
      });
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

    // THREEAR WebGL Renderer configuration - following basic.html pattern
    renderer = new window.THREE.WebGLRenderer({
      antialias: true,  // Enable antialiasing for better quality
      alpha: true,
      preserveDrawingBuffer: true  // Helps with quality on mobile devices
    });
    renderer.setClearColor(new window.THREE.Color("lightgrey"), 0);
    renderer.setPixelRatio(window.devicePixelRatio);  // Use device pixel ratio for crisp rendering
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
    
    // Initialize with performance optimizations like basic-performance.html
    window.THREEAR.initialize({ 
      source: source,
      canvasWidth: 80 * 4,   // Higher resolution for better tracking
      canvasHeight: 60 * 4,
      maxDetectionRate: 60   // Max detection rate for smooth tracking
    }).then((controller: any) => {
      // Add enhanced lighting for better 3D model visibility
      var ambientLight = new window.THREE.AmbientLight(0x404040, 0.8);  // Increased intensity
      scene.add(ambientLight);

      // Add multiple directional lights for better illumination
      var directionalLight1 = new window.THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight1.position.set(1, 1, 1);
      scene.add(directionalLight1);
      
      var directionalLight2 = new window.THREE.DirectionalLight(0xffffff, 0.4);
      directionalLight2.position.set(-1, -1, -1);
      scene.add(directionalLight2);
      
      // Add point light for additional illumination
      var pointLight = new window.THREE.PointLight(0xffffff, 0.5, 100);
      pointLight.position.set(0, 2, 2);
      scene.add(pointLight); // Load the 3D model for this organ
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

        // Rotate the 3D model if it's loaded (but not for sliced heart model)
        if ((markerGroup as any).organModel) {
          // Only rotate if it's not the sliced heart model
          if (!showSlicedModelRef.current) {
            (markerGroup as any).organModel.rotation.y +=
              (deltaMsec / 2000) * Math.PI;
          }
        }

        // Update label positions for DOM elements
        updateLabelPositions(camera);

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

  // Handle heart part click interactions - Clean version from sample App.tsx
  const handlePartClick = useCallback((partId: string) => {
    console.log("Heart part clicked:", partId);
    setSelectedPart(selectedPart === partId ? null : partId);
  }, [selectedPart]);

  // Clean Heart Labeling Functions - Based on sample App.tsx
  const createHeartLabels = useCallback(() => {
    if (!markerGroupRef.current) return;

    console.log("Creating clean heart labels...");

    // Create label group for 3D objects
    labelGroupRef.current = new window.THREE.Group();
    markerGroupRef.current.add(labelGroupRef.current);

    // Create DOM container for labels
    const labelsContainer = document.createElement('div');
    labelsContainer.id = 'heart-labels-container';
    labelsContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 10;
    `;
    document.body.appendChild(labelsContainer);

    heartParts.forEach((part) => {
      // Create invisible 3D marker for position tracking
      const markerGeometry = new window.THREE.SphereGeometry(0.05, 8, 8);
      const markerMaterial = new window.THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0
      });
      const marker = new window.THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(...part.position);
      marker.userData = { heartPart: part };
      labelGroupRef.current.add(marker);

      // Create clean label element - exact style from sample App.tsx
      const labelElement = document.createElement('div');
      labelElement.className = 'heart-label-point';
      labelElement.style.cssText = `
        position: absolute;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: ${part.color};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        pointer-events: auto;
        user-select: none;
        transform: translate(-50%, -50%);
      `;
      labelElement.textContent = part.id;
      labelElement.dataset.partId = part.id;

      // Add click handler
      labelElement.addEventListener('click', (e) => {
        e.stopPropagation();
        handlePartClick(part.id);
      });

      labelsContainer.appendChild(labelElement);
      
      // Store reference for position updates
      marker.userData.labelElement = labelElement;
    });
  }, [handlePartClick]);

  const removeHeartLabels = useCallback(() => {
    if (labelGroupRef.current && markerGroupRef.current) {
      console.log("Removing heart labels...");
      markerGroupRef.current.remove(labelGroupRef.current);
      labelGroupRef.current = null;
    }

    // Remove DOM labels container
    const labelsContainer = document.getElementById('heart-labels-container');
    if (labelsContainer) {
      document.body.removeChild(labelsContainer);
    }

    setSelectedPart(null);
  }, []);

  const updateLabelPositions = useCallback((camera: any) => {
    if (!labelGroupRef.current) return;

    labelGroupRef.current.children.forEach((marker: any) => {
      if (marker.userData.labelElement) {
        // Project 3D position to screen coordinates
        const vector = marker.position.clone();
        vector.project(camera);

        // Convert to screen coordinates
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (vector.y * -0.5 + 0.5) * window.innerHeight;

        // Update DOM element position
        const labelElement = marker.userData.labelElement;
        labelElement.style.left = `${x}px`;
        labelElement.style.top = `${y}px`;

        // Update selection styling
        const isSelected = selectedPart === marker.userData.heartPart.id;
        labelElement.style.backgroundColor = isSelected ? '#f39c12' : marker.userData.heartPart.color;
        labelElement.style.transform = isSelected ? 'translate(-50%, -50%) scale(1.2)' : 'translate(-50%, -50%) scale(1)';

        // Hide labels that are behind the camera or too far
        if (vector.z > 1) {
          labelElement.style.display = 'none';
        } else {
          labelElement.style.display = 'flex';
        }
      }
    });
  }, [selectedPart]);

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

        // Add interactive heart labels for sliced model
        createHeartLabels();

        console.log("Sliced heart model loaded successfully with interactive labels");
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

    // Remove interactive heart labels
    removeHeartLabels();

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
  }, [removeHeartLabels]);

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

      {/* Heart Part Information Panel - Clean like sample App.tsx without blur */}
      {selectedPart && (() => {
        const selectedPartData = heartParts.find(part => part.id === selectedPart);
        return selectedPartData ? (
          <div
            style={{
              position: "fixed",
              bottom: "20px",
              left: "20px",
              right: "20px",
              backgroundColor: "rgba(44, 62, 80, 0.95)",
              color: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              zIndex: 1000,
              animation: "slideUp 0.3s ease-out",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "15px",
              }}
            >
              <h3
                style={{
                  margin: "0",
                  color: "#f39c12",
                  fontSize: "20px",
                  fontWeight: "600",
                }}
              >
                {selectedPartData.name}
              </h3>
              <button
                onClick={() => setSelectedPart(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#bdc3c7",
                  fontSize: "24px",
                  cursor: "pointer",
                  padding: "0",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#bdc3c7";
                }}
              >
                ×
              </button>
            </div>
            <p
              style={{
                margin: "0",
                fontSize: "16px",
                lineHeight: "1.5",
                color: "#ecf0f1",
              }}
            >
              {selectedPartData.description}
            </p>
            <div
              style={{
                marginTop: "15px",
                padding: "10px",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                borderRadius: "8px",
                borderLeft: `4px solid ${selectedPartData.color}`,
              }}
            >
              <small
                style={{
                  color: "#95a5a6",
                  fontSize: "14px",
                }}
              >
                Click on other numbered parts to explore different areas of the heart
              </small>
            </div>
          </div>
        ) : null;
      })()}
    </div>
  );
};

export default ARScannerPage;
