import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { organs } from "../components/organData";
import { ZoomController } from "../../utils/ZoomController";
import ARControls from "../components/ARControls";
import ConfirmationDialog from "../components/ConfirmationDialog";

// Heart parts data for labeling system
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
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const showSlicedModelRef = useRef(false);
  const zoomControllerRef = useRef<ZoomController | null>(null);
  const organModelRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);
  const baseScaleRef = useRef<number>(0.5);
  const originalModelRef = useRef<any>(null);
  const labelGroupRef = useRef<any>(null);
  const raycasterRef = useRef<any>(null);
  const mouseRef = useRef<any>(null);

  if (!organ) {
    return <div>Organ not found</div>;
  }
  // Get base scale for organ type
  const getBaseScale = useCallback((organId: string): number => {
    switch (organId) {
      case "brain":
        return 0.3;
      case "heart":
        return 0.5; // Updated to match the model loading scale
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

    // Check viewport meta tag for proper AR setup
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      console.log('Viewport meta tag:', viewport.getAttribute('content'));
    } else {
      console.warn('No viewport meta tag found - this may affect AR quality');
    }

    let animationId: number;
    let renderer: any;
    let source: any;
    let clickHandler: ((event: MouseEvent) => void) | null = null;

    // EXACT COPY-CAT of basic-cutout.html script section
    renderer = new window.THREE.WebGLRenderer({
      antialias: true, // Enable antialiasing for better quality
      alpha: true,
    });
    renderer.setClearColor(new window.THREE.Color("lightgrey"), 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio at 2 for performance
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log(`Renderer initialized with pixel ratio: ${Math.min(window.devicePixelRatio, 2)}, size: ${window.innerWidth}x${window.innerHeight}`);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0px";
    renderer.domElement.style.left = "0px";
    document.body.appendChild(renderer.domElement); // init scene and camera - EXACT SAME AS BASIC.HTML
    var scene = new window.THREE.Scene();
    var camera = new window.THREE.Camera();
    scene.add(camera);
    var markerGroup = new window.THREE.Group();
    scene.add(markerGroup);

    source = new window.THREEAR.Source({ 
      renderer, 
      camera,
      sourceWidth: 1280,
      sourceHeight: 720,
      displayWidth: 1280,
      displayHeight: 720,
      // Add video constraints for better quality
      videoConstraints: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      }
    });
    
    window.THREEAR.initialize({ 
      source: source,
      canvasWidth: 80 * 4, // Increased for better quality
      canvasHeight: 60 * 4,
      maxDetectionRate: 60 // Higher detection rate
    }).then((controller: any) => {
      // Initialize raycaster and mouse for label interaction
      raycasterRef.current = new window.THREE.Raycaster();
      mouseRef.current = new window.THREE.Vector2();

      // Add lighting for better 3D model visibility
      var ambientLight = new window.THREE.AmbientLight(0x404040, 0.8); // Increased intensity
      scene.add(ambientLight);

      var directionalLight = new window.THREE.DirectionalLight(0xffffff, 1.0); // Increased intensity
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);
      
      // Add additional directional light for better illumination
      var directionalLight2 = new window.THREE.DirectionalLight(0xffffff, 0.6);
      directionalLight2.position.set(-1, -1, -1);
      scene.add(directionalLight2);      // Load the 3D model for this organ
      console.log(`Loading heart model from: ${organ.modelPath}`);
      var gltfLoader = new window.THREE.GLTFLoader();
      gltfLoader.load(
        organ.modelPath,
        (gltf: any) => {
          console.log("Heart model loaded successfully:", gltf);
          var model = gltf.scene;

          // Enhance model materials for better clarity
          model.traverse((child: any) => {
            if (child.isMesh) {
              // Improve material properties
              if (child.material) {
                child.material.transparent = false;
                child.material.alphaTest = 0.1;
                // Improve material quality
                child.material.minFilter = window.THREE.LinearFilter;
                child.material.magFilter = window.THREE.LinearFilter;
                child.material.needsUpdate = true;
                // Enable shadows if supported
                child.castShadow = true;
                child.receiveShadow = true;
              }
            }
          });

          // Log model details for debugging
          console.log(`Model bounding box:`, model.userData);
          console.log(`Model children count:`, model.children.length);

          // Scale and position the model appropriately for AR based on organ type
          let scale, positionY;
          switch (organ.id) {
            case "brain":
              scale = 0.3;
              positionY = 0.1;
              break;
            case "heart":
              scale = 0.5; // Reduced scale for better clarity
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
        (progress: any) => {
          // Log loading progress
          console.log('Heart model loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        (error: any) => {
          console.error("Error loading 3D model:", error);
          console.error("Model path attempted:", organ.modelPath);
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
        minConfidence: 0.6, // Improved confidence threshold
        smooth: true, // Enable smoothing for better tracking
        smoothCount: 5, // Number of frames to smooth over
        smoothTolerance: 0.01, // Tolerance for smoothing
        smoothThreshold: 2 // Threshold for smoothing
      });

      controller.trackMarker(patternMarker);

      // Add click event listener for label interaction
      clickHandler = (event: MouseEvent) => handleCanvasClick(event, camera, renderer);
      renderer.domElement.addEventListener('click', clickHandler);

      // Debug: Log when marker is found/lost
      patternMarker.addEventListener('getMarker', () => {
        console.log('Marker detected - model should be visible');
      });

      patternMarker.addEventListener('lostMarker', () => {
        console.log('Marker lost - model hidden');
      }); // Use EXACT SAME animation loop as basic.html - THIS IS KEY!
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
      
      // Remove click event listener
      if (renderer && renderer.domElement && clickHandler) {
        renderer.domElement.removeEventListener('click', clickHandler);
      }

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

  // Function to create heart part labels
  const createHeartLabels = useCallback(() => {
    if (!markerGroupRef.current) return;

    console.log("Creating heart part labels...");

    // Create a group for all labels
    const labelGroup = new window.THREE.Group();
    labelGroupRef.current = labelGroup;

    heartParts.forEach((part) => {
      // Create a sphere for the label point
      const geometry = new window.THREE.SphereGeometry(0.02, 16, 16);
      const material = new window.THREE.MeshBasicMaterial({
        color: part.color,
        transparent: true,
        opacity: 0.8,
      });
      const sphere = new window.THREE.Mesh(geometry, material);
      
      // Position the label
      sphere.position.set(part.position[0], part.position[1], part.position[2]);
      
      // Add click functionality
      sphere.userData = { partId: part.id, partName: part.name };
      
      labelGroup.add(sphere);

      // Create text label
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = 64;
        canvas.height = 64;
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'black';
        context.font = 'Bold 20px Arial';
        context.textAlign = 'center';
        context.fillText(part.id, canvas.width / 2, canvas.height / 2 + 7);
        
        const texture = new window.THREE.CanvasTexture(canvas);
        const spriteMaterial = new window.THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new window.THREE.Sprite(spriteMaterial);
        sprite.position.set(part.position[0] + 0.1, part.position[1] + 0.1, part.position[2]);
        sprite.scale.set(0.1, 0.1, 0.1);
        
        labelGroup.add(sprite);
      }
    });

    // Add label group to marker group
    markerGroupRef.current.add(labelGroup);
    console.log("Heart part labels created successfully");
  }, []);

  // Function to remove heart labels
  const removeHeartLabels = useCallback(() => {
    if (labelGroupRef.current && markerGroupRef.current) {
      markerGroupRef.current.remove(labelGroupRef.current);
      labelGroupRef.current = null;
      console.log("Heart part labels removed");
    }
  }, []);

  // Function to handle part selection
  const handlePartClick = useCallback((partId: string) => {
    setSelectedPart(partId === selectedPart ? null : partId);
    console.log(`Selected heart part: ${partId}`);
  }, [selectedPart]);

  // Function to load sliced heart model with labels
  const loadSlicedHeartModel = useCallback(() => {
    if (!markerGroupRef.current || !organModelRef.current) return;

    console.log("Loading sliced heart model with labels...");

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
        const scale = 0.5; // Updated to match the regular heart scale
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

        // Create heart part labels
        createHeartLabels();

        console.log("Sliced heart model with labels loaded successfully");
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
  }, [createHeartLabels]);

  // Handle canvas click for label interaction
  const handleCanvasClick = useCallback((event: MouseEvent, camera: any, renderer: any) => {
    if (!showSlicedModel || !labelGroupRef.current || !raycasterRef.current) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, camera);
    const intersects = raycasterRef.current.intersectObjects(labelGroupRef.current.children, true);

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      if (clickedObject.userData && clickedObject.userData.partId) {
        handlePartClick(clickedObject.userData.partId);
      }
    }
  }, [showSlicedModel, handlePartClick]);

  // Function to restore original model
  const restoreOriginalModel = useCallback(() => {
    if (!markerGroupRef.current || !originalModelRef.current) return;

    console.log("Restoring original heart model...");

    // Remove current sliced model from scene
    if (organModelRef.current) {
      markerGroupRef.current.remove(organModelRef.current);
    }

    // Remove heart labels
    removeHeartLabels();

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

      {/* Heart Part Information Panel */}
      {selectedPart && showSlicedModel && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            right: "20px",
            backgroundColor: "rgba(44, 62, 80, 0.95)",
            color: "white",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            backdropFilter: "blur(10px)",
            zIndex: 200,
            maxWidth: "400px",
            margin: "0 auto",
          }}
        >
          {(() => {
            const selectedPartData = heartParts.find((part) => part.id === selectedPart);
            return selectedPartData ? (
              <>
                <h3 style={{ margin: "0 0 10px 0", color: "#f39c12" }}>
                  {selectedPartData.name}
                </h3>
                <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.4" }}>
                  {selectedPartData.description}
                </p>
                <button
                  onClick={() => setSelectedPart(null)}
                  style={{
                    marginTop: "10px",
                    padding: "5px 10px",
                    backgroundColor: "#e74c3c",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Close
                </button>
              </>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};

export default ARScannerPage;
