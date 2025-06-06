import React, { useCallback } from "react";

interface ARTouchHandlerProps {
  zoomControllerRef: React.RefObject<any>;
  showConfirmation: boolean;
}

// Using a custom hook pattern instead of FC since we're returning functions, not JSX
const useARTouchHandlers = ({
  zoomControllerRef,
  showConfirmation,
}: ARTouchHandlerProps) => {
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
    [showConfirmation, zoomControllerRef]
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
    [showConfirmation, zoomControllerRef]
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
    [showConfirmation, zoomControllerRef]
  );

  // Return the handlers to be used in the parent component
  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};

export default useARTouchHandlers;
