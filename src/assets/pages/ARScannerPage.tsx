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
  const zoomControllerRef = useRef<ZoomController | null>(null);
  const organModelRef = useRef<any>(null);  const markerGroupRef = useRef<any>(null);
  const baseScaleRef = useRef<number>(0.5);

  // Sliced model state
  const [isSlicedModel, setIsSlicedModel] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const slicedModelRef = useRef<any>(null);

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
      default:        return 0.5;
    }
  }, []);

  // Sliced model functions
  const loadSlicedModel = useCallback(async (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (organ.id !== "heart") {
        reject(new Error("Sliced model only available for heart"));
        return;
      }

      const gltfLoader = new window.THREE.GLTFLoader();
      gltfLoader.load(
        "/sliced_organs/heart.glb",
        (gltf: any) => {
          console.log("Sliced heart model loaded successfully");
          resolve(gltf.scene);
        },
        (progress: any) => {
          console.log("Loading sliced heart model...", progress);
        },
        (error: any) => {
          console.error("Failed to load sliced heart model:", error);
          reject(error);
        }
      );
    });
  }, [organ.id]);

  const transitionToSlicedModel = useCallback(async () => {
    if (organ.id !== "heart" || isTransitioning || isSlicedModel) {
      console.log("Cannot transition to sliced model:", {
        organId: organ.id,
        isTransitioning,
        isSlicedModel,
      });
      return;
    }

    setIsTransitioning(true);
    console.log("Starting transition to sliced heart model...");

    try {
      // Load sliced model if not already loaded
      if (!slicedModelRef.current) {
        slicedModelRef.current = await loadSlicedModel();

        // Apply same positioning as normal model
        const scale = baseScaleRef.current * currentZoom;
        slicedModelRef.current.scale.set(scale, scale, scale);
        slicedModelRef.current.position.copy(organModelRef.current.position);

        // Start with invisible and very small
        slicedModelRef.current.traverse((child: any) => {
          if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: any) => {
                mat.transparent = true;
                mat.opacity = 0;
              });
            } else {
              child.material.transparent = true;
              child.material.opacity = 0;
            }
          }
        });
        slicedModelRef.current.scale.set(0.01, 0.01, 0.01);
      }

      // Add sliced model to scene
      if (markerGroupRef.current && slicedModelRef.current) {
        markerGroupRef.current.add(slicedModelRef.current);
      }

      // Phase 1: Shrink normal model (500ms)
      const shrinkDuration = 500;
      const shrinkStartTime = Date.now();
      const originalScale = organModelRef.current.scale.x;

      const shrinkAnimate = () => {
        const elapsed = Date.now() - shrinkStartTime;
        const progress = Math.min(elapsed / shrinkDuration, 1);

        // Ease-in animation for shrinking
        const easeIn = progress * progress;
        const currentScale = originalScale * (1 - easeIn);

        if (organModelRef.current) {
          organModelRef.current.scale.set(
            currentScale,
            currentScale,
            currentScale
          );
        }

        if (progress < 1) {
          requestAnimationFrame(shrinkAnimate);
        } else {
          // Phase 2: Pop up sliced model (700ms)
          const popDuration = 700;
          const popStartTime = Date.now();
          const targetScale = baseScaleRef.current * currentZoom;

          const popAnimate = () => {
            const elapsed = Date.now() - popStartTime;
            const progress = Math.min(elapsed / popDuration, 1);

            // Bounce effect for pop-up
            const bounce =
              progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            const currentScale = targetScale * bounce;
            const opacity = progress;

            if (slicedModelRef.current) {
              slicedModelRef.current.scale.set(
                currentScale,
                currentScale,
                currentScale
              );
              slicedModelRef.current.traverse((child: any) => {
                if (child.isMesh && child.material) {
                  if (Array.isArray(child.material)) {
                    child.material.forEach((mat: any) => {
                      mat.opacity = opacity;
                    });
                  } else {
                    child.material.opacity = opacity;
                  }
                }
              });
            }

            if (progress < 1) {
              requestAnimationFrame(popAnimate);
            } else {
              // Hide normal model and complete transition
              if (organModelRef.current) {
                organModelRef.current.visible = false;
              }
              setIsSlicedModel(true);
              setIsTransitioning(false);
              console.log("Transition to sliced heart model complete");
            }
          };

          requestAnimationFrame(popAnimate);
        }
      };

      requestAnimationFrame(shrinkAnimate);
    } catch (error) {
      console.error("Failed to transition to sliced model:", error);
      setIsTransitioning(false);
    }
  }, [
    organ.id,
    isTransitioning,
    isSlicedModel,
    loadSlicedModel,
    currentZoom,
  ]);

  const transitionToNormalModel = useCallback(() => {
    if (!isSlicedModel || isTransitioning) {
      return;
    }

    setIsTransitioning(true);
    console.log("Starting transition back to normal heart model...");

    const duration = 600;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Fade out and shrink sliced model
      if (slicedModelRef.current) {
        const scale = (1 - progress) * baseScaleRef.current * currentZoom;
        const opacity = 1 - progress;

        slicedModelRef.current.scale.set(scale, scale, scale);
        slicedModelRef.current.traverse((child: any) => {
          if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: any) => {
                mat.opacity = opacity;
              });
            } else {
              child.material.opacity = opacity;
            }
          }
        });
      }

      // Fade in and grow normal model
      if (organModelRef.current) {
        const targetScale = baseScaleRef.current * currentZoom;
        const scale = progress * targetScale;

        organModelRef.current.visible = true;
        organModelRef.current.scale.set(scale, scale, scale);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Remove sliced model from scene
        if (markerGroupRef.current && slicedModelRef.current) {
          markerGroupRef.current.remove(slicedModelRef.current);
        }

        setIsSlicedModel(false);
        setIsTransitioning(false);
        console.log("Transition back to normal heart model complete");
      }
    };

    requestAnimationFrame(animate);
  }, [isSlicedModel, isTransitioning, currentZoom]);

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
      },      onMaxZoomReached: () => {
        console.log("ARScannerPage: Max zoom reached");
        if (organ.id === "heart") {
          console.log("Triggering sliced heart model transition");
          transitionToSlicedModel();
        } else {
          console.log("Showing max zoom message for non-heart organ");
          setShowMaxZoomMessage(true);
        }
      },
    });

    console.log("Zoom controller initialized successfully");    return () => {
      console.log("Cleaning up zoom controller");
      zoomControllerRef.current?.destroy();
    };
  }, [organ.id, getBaseScale, transitionToSlicedModel]);// Zoom control handlers
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
    
    // If we're viewing sliced model, transition back to normal first
    if (isSlicedModel) {
      console.log("Transitioning back to normal model before zoom out");
      transitionToNormalModel();
    }
    
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
  }, [isSlicedModel, transitionToNormalModel]);
  const handleResetZoom = useCallback(() => {
    console.log("=== ARScannerPage: Reset Zoom button clicked ===");
    console.log("ZoomController exists:", !!zoomControllerRef.current);
    console.log("Model exists:", !!organModelRef.current);
    
    // If we're viewing sliced model, transition back to normal first
    if (isSlicedModel) {
      console.log("Transitioning back to normal model before zoom reset");
      transitionToNormalModel();
    }
    
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
  }, [isSlicedModel, transitionToNormalModel]);

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
    document.body.appendChild(renderer.domElement); // init scene and camera - EXACT SAME AS BASIC.HTML
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
        controller.update(source.domElement);        // Rotate the 3D model if it's loaded and not in sliced mode
        if ((markerGroup as any).organModel && !isSlicedModel) {
          (markerGroup as any).organModel.rotation.y +=
            (deltaMsec / 2000) * Math.PI;
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
        }      });
    };
  }, [organ, isSlicedModel]);
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
        )}        {modelError && (
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
        {isTransitioning && (
          <div
            style={{
              backgroundColor: "rgba(138, 43, 226, 0.8)",
              padding: "8px",
              marginTop: "10px",
              borderRadius: "4px",
              color: "white",
            }}
          >
            🔄 Transitioning to {isSlicedModel ? "normal" : "sliced"} heart model...
          </div>
        )}
        {isSlicedModel && !isTransitioning && (
          <div
            style={{
              backgroundColor: "rgba(40, 167, 69, 0.8)",
              padding: "8px",
              marginTop: "10px",
              borderRadius: "4px",
              color: "white",
            }}
          >
            ✨ Viewing sliced heart model - Zoom out to return to normal view
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
    </div>
  );
};

export default ARScannerPage;
