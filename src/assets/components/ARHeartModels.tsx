import React, { useCallback } from "react";

interface ARHeartModelsProps {
  markerGroupRef: React.RefObject<any>;
  organModelRef: React.RefObject<any>;
  originalModelRef: React.RefObject<any>;
  zoomControllerRef: React.RefObject<any>;
  showSlicedModelRef: React.RefObject<boolean>;
}

// Using a custom hook pattern instead of FC since we're returning functions, not JSX
const useARHeartModels = ({
  markerGroupRef,
  organModelRef,
  originalModelRef,
  zoomControllerRef,
}: ARHeartModelsProps) => {
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
  }, [markerGroupRef, organModelRef, originalModelRef, zoomControllerRef]);

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
  }, [markerGroupRef, organModelRef, originalModelRef]);

  return { loadSlicedHeartModel, restoreOriginalModel };
};

export default useARHeartModels;
