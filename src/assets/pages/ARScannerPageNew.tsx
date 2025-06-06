import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { organs } from "../components/organData";
import { ZoomController } from "../../utils/ZoomController";

// Import modular components
import ARHeader from "../components/ARHeader";
import ARModelHandler from "../components/ARModelHandler";
import ARControls from "../components/ARControls";
import ConfirmationDialog from "../components/ConfirmationDialog";
import useARTouchHandlers from "../components/ARTouchHandler";
import useARHeartModels from "../components/ARHeartModels";

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

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomControllerRef = useRef<ZoomController | null>(null);
  const organModelRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);
  const baseScaleRef = useRef<number>(0.5);
  const originalModelRef = useRef<any>(null);
  const showSlicedModelRef = useRef(false);

  // State
  const [modelLoading, setModelLoading] = useState(true);
  const [modelError, setModelError] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(1.0);
  const [isZoomAnimating, setIsZoomAnimating] = useState(false);
  const [showMaxZoomMessage, setShowMaxZoomMessage] = useState(false);
  const [showSlicedModel, setShowSlicedModel] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

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
      },
      onThresholdCrossed: (threshold: string, zoom: number) => {
        console.log(
          `ARScannerPage: Zoom threshold crossed: ${threshold} at ${zoom}x`
        );
      },
      onMaxZoomReached: () => {
        if (organ.id === "heart") {
          console.log(
            "ARScannerPage: Max zoom reached - showing sliced heart confirmation"
          );
          setShowConfirmation(true);

          // Hide the original model when showing the confirmation dialog
          if (organModelRef.current && markerGroupRef.current) {
            originalModelRef.current = organModelRef.current;
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
  }, [organ.id, getBaseScale]);

  // Zoom control handlers
  const handleZoomIn = useCallback(() => {
    console.log("=== ARScannerPage: Zoom In button clicked ===");
    if (zoomControllerRef.current) {
      zoomControllerRef.current.zoomIn();
    }
    setIsZoomAnimating(true);
    setTimeout(() => setIsZoomAnimating(false), 300);
  }, []);

  const handleZoomOut = useCallback(() => {
    console.log("=== ARScannerPage: Zoom Out button clicked ===");
    if (zoomControllerRef.current) {
      zoomControllerRef.current.zoomOut();
    }
    setIsZoomAnimating(true);
    setTimeout(() => setIsZoomAnimating(false), 300);
  }, []);

  const handleResetZoom = useCallback(() => {
    console.log("=== ARScannerPage: Reset Zoom button clicked ===");
    if (zoomControllerRef.current) {
      zoomControllerRef.current.resetZoom();
    }
    setIsZoomAnimating(true);
    setTimeout(() => setIsZoomAnimating(false), 300);
  }, []);
  // Use AR touch handlers hook
  const { handleTouchStart, handleTouchMove, handleTouchEnd } =
    useARTouchHandlers({
      zoomControllerRef,
      showConfirmation,
    });

  // Use AR heart models hook
  const { loadSlicedHeartModel, restoreOriginalModel } = useARHeartModels({
    markerGroupRef,
    organModelRef,
    originalModelRef,
    zoomControllerRef,
    showSlicedModelRef,
  });

  // Handle model loaded callback
  const handleModelLoaded = useCallback(
    (model: any) => {
      organModelRef.current = model;
      setModelLoading(false);
      console.log(`${organ.name} 3D model loaded successfully`);
    },
    [organ.name]
  );

  // Handle model loading error callback
  const handleModelLoadingError = useCallback(() => {
    setModelLoading(false);
    setModelError(true);
  }, []);

  // Handle marker group created callback
  const handleMarkerGroupCreated = useCallback((markerGroup: any) => {
    markerGroupRef.current = markerGroup;
  }, []);

  // Handle sliced model effect
  useEffect(() => {
    if (showSlicedModel) {
      loadSlicedHeartModel();
    }
  }, [showSlicedModel, loadSlicedHeartModel]);

  // Handle confirmation dialog actions
  const handleConfirmViewSlicedHeart = useCallback(() => {
    console.log(
      "User confirmed to view sliced heart model - navigating to SlicedHeartPage"
    );
    setShowConfirmation(false);
    navigate("/sliced-heart");
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

  // Add touch event listeners
  useEffect(() => {
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

    return () => {
      document.removeEventListener("touchstart", handleTouchStartEvent);
      document.removeEventListener("touchmove", handleTouchMoveEvent);
      document.removeEventListener("touchend", handleTouchEndEvent);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

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
      {/* Header Component */}
      <ARHeader
        organName={organ.name}
        modelLoading={modelLoading}
        modelError={modelError}
      />
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
      />{" "}
      {/* AR Model Handler Component */}
      <ARModelHandler
        organId={organ.id}
        onModelLoaded={handleModelLoaded}
        onModelLoadingError={handleModelLoadingError}
        onMarkerGroupCreated={handleMarkerGroupCreated}
        containerRef={containerRef}
        zoomControllerRef={zoomControllerRef}
        showSlicedModelRef={showSlicedModelRef}
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
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        onConfirm={handleConfirmViewSlicedHeart}
        onCancel={handleCancelViewSlicedHeart}
      />
    </div>
  );
};

export default ARScannerPage;
