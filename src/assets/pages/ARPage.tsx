import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ZoomController } from "../../utils/ZoomController";
import { ARControls } from "../components/ARControls";
import {
  ModelReference,
  TouchState,
  HeartViewState,
} from "../../types/ARTypes";
import "../ARInterface.css";

// Declare global variables for the libraries
declare global {
  interface Window {
    THREE: any;
    THREEAR: any;
  }
}

const ARPage: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelError, setModelError] = useState(false);

  // AR and Zoom State Management
  const [modelRef, setModelRef] = useState<ModelReference | null>(null);
  const [zoomController] = useState(() => new ZoomController());
  const [currentZoom, setCurrentZoom] = useState(1.0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentViewState, setCurrentViewState] =
    useState<HeartViewState>("normal");
  const [touchState, setTouchState] = useState<TouchState>({
    isPinching: false,
    initialDistance: 0,
    baseZoom: 1.0,
    lastTouchTime: 0,
  });

  // Zoom Handlers
  const handleZoomIn = useCallback(async () => {
    if (!modelRef || isAnimating) return;

    setIsAnimating(true);
    const newZoom = Math.min(3.0, currentZoom + 0.2);

    try {
      await zoomController.animateZoom(
        newZoom,
        modelRef.organModel,
        () => {
          setIsAnimating(false);
          updateViewState(newZoom);
        },
        (zoom) => setCurrentZoom(zoom)
      );
    } catch (error) {
      console.error("Zoom in failed:", error);
      setIsAnimating(false);
    }
  }, [modelRef, isAnimating, currentZoom, zoomController]);

  const handleZoomOut = useCallback(async () => {
    if (!modelRef || isAnimating) return;

    setIsAnimating(true);
    const newZoom = Math.max(0.5, currentZoom - 0.2);

    try {
      await zoomController.animateZoom(
        newZoom,
        modelRef.organModel,
        () => {
          setIsAnimating(false);
          updateViewState(newZoom);
        },
        (zoom) => setCurrentZoom(zoom)
      );
    } catch (error) {
      console.error("Zoom out failed:", error);
      setIsAnimating(false);
    }
  }, [modelRef, isAnimating, currentZoom, zoomController]);

  const handleReset = useCallback(async () => {
    if (!modelRef || isAnimating) return;

    setIsAnimating(true);

    try {
      await zoomController.animateZoom(
        1.0,
        modelRef.organModel,
        () => {
          setIsAnimating(false);
          setCurrentViewState("normal");
        },
        (zoom) => setCurrentZoom(zoom)
      );
    } catch (error) {
      console.error("Reset failed:", error);
      setIsAnimating(false);
    }
  }, [modelRef, isAnimating, zoomController]);

  // Update view state based on zoom level
  const updateViewState = useCallback((zoom: number) => {
    if (zoom >= 2.5) {
      setCurrentViewState("detailed");
    } else if (zoom >= 2.0) {
      setCurrentViewState("labeled");
    } else if (zoom >= 1.5) {
      setCurrentViewState("slicing");
    } else {
      setCurrentViewState("normal");
    }
  }, []);

  // Touch Event Handlers for Pinch-to-Zoom
  const getTouchDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (event.touches.length === 2 && !isAnimating) {
        event.preventDefault();
        const distance = getTouchDistance(event.touches);
        setTouchState({
          isPinching: true,
          initialDistance: distance,
          baseZoom: currentZoom,
          lastTouchTime: Date.now(),
        });
      }
    },
    [currentZoom, isAnimating]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (touchState.isPinching && event.touches.length === 2 && modelRef) {
        event.preventDefault();
        const currentDistance = getTouchDistance(event.touches);
        const scale = currentDistance / touchState.initialDistance;
        const newZoom = Math.max(
          0.5,
          Math.min(3.0, touchState.baseZoom * scale)
        );

        // Apply zoom directly to model for immediate feedback
        if (modelRef.organModel) {
          modelRef.organModel.scale.setScalar(newZoom);
          setCurrentZoom(newZoom);
          updateViewState(newZoom);
        }
      }
    },
    [touchState, modelRef, updateViewState]
  );

  const handleTouchEnd = useCallback(
    (_event: TouchEvent) => {
      if (touchState.isPinching) {
        setTouchState({
          isPinching: false,
          initialDistance: 0,
          baseZoom: currentZoom,
          lastTouchTime: Date.now(),
        });
      }
    },
    [touchState, currentZoom]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize AR with heart model by default
    var renderer = new window.THREE.WebGLRenderer({
      alpha: true,
    });
    renderer.setClearColor(new window.THREE.Color("lightgrey"), 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0px";
    renderer.domElement.style.left = "0px";
    document.body.appendChild(renderer.domElement);

    var scene = new window.THREE.Scene();
    var camera = new window.THREE.Camera();
    scene.add(camera);

    var markerGroup = new window.THREE.Group();
    scene.add(markerGroup);

    var source = new window.THREEAR.Source({ renderer, camera });
    window.THREEAR.initialize({ source: source }).then((controller: any) => {
      // Add lighting for better 3D model visibility
      var ambientLight = new window.THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      var directionalLight = new window.THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      // Load the heart 3D model
      var gltfLoader = new window.THREE.GLTFLoader();
      gltfLoader.load(
        "/realistic_human_heart/scene.gltf", // Default to heart model
        (gltf: any) => {
          var model = gltf.scene;

          // Scale and position the heart model for AR
          const scale = 0.8;
          const positionY = 0;

          model.scale.set(scale, scale, scale);
          model.position.y = positionY;
          markerGroup.add(model);

          // Store model reference for animation
          (markerGroup as any).organModel = model;

          // Create model reference for zoom system
          const modelReference: ModelReference = {
            markerGroup,
            organModel: model,
            renderer,
            scene,
            camera,
            controller,
            source,
          };
          setModelRef(modelReference);

          // Model loaded successfully
          setModelLoading(false);
          console.log("Heart 3D model loaded successfully for AR view");
        },
        undefined,
        (error: any) => {
          console.error("Error loading heart 3D model:", error);
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

      // Add touch event listeners for pinch-to-zoom
      document.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd, { passive: false });

      // Animation loop
      var lastTimeMsec = 0;
      requestAnimationFrame(function animate(nowMsec: number) {
        requestAnimationFrame(animate);
        lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
        var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
        lastTimeMsec = nowMsec;

        controller.update(source.domElement);

        // Rotate the heart model if it's loaded
        if ((markerGroup as any).organModel) {
          const model = (markerGroup as any).organModel;
          model.rotation.y += (deltaMsec / 2000) * Math.PI;

          // Apply current zoom level to model (base scale for heart is 0.8)
          const baseScale = 0.8;
          model.scale.setScalar(baseScale * currentZoom);
        }

        renderer.render(scene, camera);
      });
    });

    // Cleanup
    return () => {
      // Remove touch event listeners
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);

      // Remove the renderer element from document.body
      const rendererElements = document.querySelectorAll("canvas");
      rendererElements.forEach((canvas) => {
        if (canvas.parentElement === document.body) {
          document.body.removeChild(canvas);
        }
      });

      // Clean up zoom controller
      zoomController.destroy();
    };
  }, [
    currentZoom,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    zoomController,
  ]);

  return (
    <div style={{ margin: "0px", overflow: "hidden", fontFamily: "Monospace" }}>
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
        <div>AR Heart Visualization - Point your camera at the Hiro marker</div>
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
            🔄 Loading Heart 3D model...
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
          ← Back to Menu [Heart AR Visualization]
        </div>
      </div>

      {/* AR Zoom Controls */}
      {!modelLoading && !modelError && (
        <ARControls
          currentZoom={currentZoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
          isAnimating={isAnimating}
          currentViewState={currentViewState}
          disabled={false}
        />
      )}

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

export default ARPage;
