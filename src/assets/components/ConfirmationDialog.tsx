import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      console.log("ConfirmationDialog mounted and visible");
      
      const handleConfirmClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Confirm button clicked in portal dialog");
        onConfirm();
      };

      const handleCancelClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Cancel button clicked in portal dialog");
        onCancel();
      };

      // Add multiple event types for better compatibility
      if (confirmButtonRef.current) {
        confirmButtonRef.current.addEventListener('click', handleConfirmClick, { capture: true });
        confirmButtonRef.current.addEventListener('touchend', handleConfirmClick, { capture: true });
        confirmButtonRef.current.addEventListener('mousedown', handleConfirmClick, { capture: true });
      }
      
      if (cancelButtonRef.current) {
        cancelButtonRef.current.addEventListener('click', handleCancelClick, { capture: true });
        cancelButtonRef.current.addEventListener('touchend', handleCancelClick, { capture: true });
        cancelButtonRef.current.addEventListener('mousedown', handleCancelClick, { capture: true });
      }

      // Focus the confirm button for better accessibility
      if (confirmButtonRef.current) {
        confirmButtonRef.current.focus();
      }

      // Cleanup
      return () => {
        if (confirmButtonRef.current) {
          confirmButtonRef.current.removeEventListener('click', handleConfirmClick);
          confirmButtonRef.current.removeEventListener('touchend', handleConfirmClick);
          confirmButtonRef.current.removeEventListener('mousedown', handleConfirmClick);
        }
        
        if (cancelButtonRef.current) {
          cancelButtonRef.current.removeEventListener('click', handleCancelClick);
          cancelButtonRef.current.removeEventListener('touchend', handleCancelClick);
          cancelButtonRef.current.removeEventListener('mousedown', handleCancelClick);
        }
      };
    }
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  const dialogContent = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999999,
        pointerEvents: "auto",
      }}
      onClick={(e) => {
        // Close dialog if clicking on backdrop
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "15px",
          maxWidth: "90%",
          width: "400px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          pointerEvents: "auto",
          zIndex: 1000000,
          position: "relative",
          border: "2px solid #ddd",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ 
          margin: "0 0 20px 0", 
          color: "#333",
          fontSize: "20px",
          fontWeight: "bold"
        }}>
          Explore Interactive Heart Anatomy
        </h3>
        <p style={{ 
          margin: "0 0 30px 0", 
          color: "#666",
          lineHeight: "1.5",
          fontSize: "16px"
        }}>
          You've reached maximum zoom level! Would you like to explore the 
          interactive sliced heart anatomy with detailed 3D labels and information panels?
        </p>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between",
          gap: "15px"
        }}>
          <button
            ref={cancelButtonRef}
            type="button"
            style={{
              padding: "12px 25px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#6c757d",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              flex: 1,
              fontSize: "16px",
              transition: "background-color 0.2s",
              pointerEvents: "auto",
              zIndex: 1000001,
              position: "relative",
              userSelect: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#5a6268";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#6c757d";
            }}
          >
            Cancel
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            style={{
              padding: "12px 25px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#28a745",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              flex: 1,
              fontSize: "16px",
              transition: "background-color 0.2s",
              pointerEvents: "auto",
              zIndex: 1000001,
              position: "relative",
              userSelect: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#218838";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#28a745";
            }}
          >
            Explore Interactive Anatomy
          </button>
        </div>
      </div>
    </div>
  );

  // Render as portal to document.body to escape any parent event handling
  return createPortal(dialogContent, document.body);
};

export default ConfirmationDialog;
