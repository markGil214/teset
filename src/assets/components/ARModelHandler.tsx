import React, { useRef, useEffect } from "react";
import { organs } from "../components/organData";

// Module-level initialization tracking to prevent double initialization in StrictMode
let isARSceneInitialized = false;

interface ARModelHandlerProps {
  organId: string;
  onModelLoaded: (model: any) => void;
  onModelLoadingError: () => void;
  onMarkerGroupCreated: (markerGroup: any) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  zoomControllerRef: React.RefObject<any>;
  showSlicedModelRef: React.RefObject<boolean>;
}

const ARModelHandler: React.FC<ARModelHandlerProps> = ({
  organId,
  onModelLoaded,
  onModelLoadingError,
  onMarkerGroupCreated,
  containerRef,
  zoomControllerRef,
  showSlicedModelRef,
}) => {  const animationIdRef = useRef<number | undefined>(undefined);
  const rendererRef = useRef<any>(null);
  const sourceRef = useRef<any>(null);
  const organModelRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);
  const initializationRef = useRef(false);

  const organ = organs.find((o) => o.id === organId);  useEffect(() => {
    if (!containerRef.current || !organ) return;

    // Prevent duplicate initialization using module-level flag
    if (isARSceneInitialized) {
      console.log("AR scene already initialized globally, skipping...");
      return;
    }

    console.log(`Initializing AR scene for ${organ.name}`);
    isARSceneInitialized = true;
    initializationRef.current = true;

    // Create renderer with performance optimizations
    const renderer = new window.THREE.WebGLRenderer({
      alpha: true,
      canvas: document.createElement("canvas"),
      context: null,
      powerPreference: "high-performance",
      antialias: false, // Disable antialiasing for better performance
    });

    // Set willReadFrequently attribute for better performance with getImageData
    if (renderer.domElement) {
      renderer.domElement.setAttribute("willReadFrequently", "true");
    }

    renderer.setClearColor(new window.THREE.Color("lightgrey"), 0);

    // Limit pixel ratio for better performance (max 2.0)
    const pixelRatio = Math.min(window.devicePixelRatio, 2.0);
    renderer.setPixelRatio(pixelRatio);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0px";
    renderer.domElement.style.left = "0px";
    document.body.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Init scene and camera
    var scene = new window.THREE.Scene();
    var camera = new window.THREE.Camera();
    scene.add(camera);
    var markerGroup = new window.THREE.Group();
    scene.add(markerGroup);
    markerGroupRef.current = markerGroup;
    onMarkerGroupCreated(markerGroup);

    // Create optimized AR source
    const source = new window.THREEAR.Source({
      renderer,
      camera,
      sourceWidth: 640, // Lower resolution for better performance
      sourceHeight: 480,
      displayWidth: window.innerWidth,
      displayHeight: window.innerHeight,
    });
    sourceRef.current = source;

    // Setup source DOM element with performance attributes
    if (source.domElement) {
      source.domElement.style.position = "absolute";
      source.domElement.style.top = "0px";
      source.domElement.style.left = "0px";
      source.domElement.style.zIndex = "-2"; // Behind the canvas but still active

      // Add willReadFrequently attribute to the video element
      source.domElement.setAttribute("willReadFrequently", "true");

      // Set additional performance attributes
      if (source.domElement instanceof HTMLVideoElement) {
        source.domElement.playsInline = true;
        source.domElement.autoplay = true;
        source.domElement.muted = true;
      }

      document.body.appendChild(source.domElement);
    }

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
          (markerGroup as any).organModel = model;
          onModelLoaded(model);

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

          console.log(
            `${organ.name} 3D model loaded successfully with scale: ${scale}`
          );
        },
        undefined,
        (error: any) => {
          console.error("Error loading 3D model:", error);
          onModelLoadingError();

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

      // Improved animation loop with throttling
      var lastTimeMsec = 0;
      var lastUpdateTime = 0;
      const UPDATE_INTERVAL = 1000 / 30; // 30fps throttling for better performance

      function animate(nowMsec: number) {
        // Keep looping
        animationIdRef.current = requestAnimationFrame(animate);

        // Measure time
        lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
        var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
        lastTimeMsec = nowMsec;

        // Throttle updates to improve performance
        if (nowMsec - lastUpdateTime > UPDATE_INTERVAL) {
          lastUpdateTime = nowMsec;

          // Make sure the source element is valid before calling update
          if (source && source.domElement) {
            // Check if it's a video element with readyState
            if (
              !(source.domElement instanceof HTMLVideoElement) ||
              (source.domElement instanceof HTMLVideoElement &&
                source.domElement.readyState >= 2)
            ) {
              try {
                // Call each update function
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
              } catch (error) {
                console.error("Error in AR update:", error);
                // Continue the animation loop even if there's an error
              }
            }
          }
        }
      }

      animationIdRef.current = requestAnimationFrame(animate);
    });

    // Cleanup function
    return () => {
      // Cancel animation frame
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      // Stop camera stream
      if (sourceRef.current && sourceRef.current.domElement) {
        // First remove any src object to stop media streams
        if (sourceRef.current.domElement.srcObject) {
          const stream = sourceRef.current.domElement.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          sourceRef.current.domElement.srcObject = null;
        }

        // Then remove the element from the DOM if it's still there
        if (sourceRef.current.domElement.parentNode) {
          sourceRef.current.domElement.parentNode.removeChild(
            sourceRef.current.domElement
          );
        }
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
      });      // Remove video elements that might be created by AR
      const videoElements = document.querySelectorAll("video");
      videoElements.forEach((video) => {
        if (video.parentElement === document.body) {
          video.srcObject = null;
          document.body.removeChild(video);
        }
      });

      // Reset initialization flag      console.log("AR scene cleanup complete, resetting initialization flag");
      initializationRef.current = false;
      // Don't reset the module-level flag to prevent re-initialization
    };
  }, [
    organId,
    onModelLoaded,
    onModelLoadingError,
    onMarkerGroupCreated,
    containerRef,
    zoomControllerRef,
    showSlicedModelRef,
  ]);

  return null; // This component doesn't render anything itself
};

export default ARModelHandler;
