// Zoom logic and animations for AR heart visualization
import { ZoomState, ZoomConfig } from "../types/ARTypes";

export class ZoomController {
  private zoomState: ZoomState;
  private config: ZoomConfig;
  private animationFrameId: number | null = null;

  constructor(config?: Partial<ZoomConfig>) {
    this.config = {
      minZoom: 0.5,
      maxZoom: 3.0,
      zoomStep: 0.2,
      animationDuration: 300,
      easing: "ease-out",
      ...config,
    };

    this.zoomState = {
      currentZoom: 1.0,
      isAnimating: false,
      thresholds: {
        normalView: 1.0,
        startSlicing: 1.5,
        showLabels: 2.0,
        maxDetail: 2.5,
      },
    };
  }

  // Get current zoom state
  getZoomState(): ZoomState {
    return { ...this.zoomState };
  }

  // Check if zoom value is within valid range
  private isValidZoom(zoom: number): boolean {
    return zoom >= this.config.minZoom && zoom <= this.config.maxZoom;
  }

  // Smooth zoom animation using requestAnimationFrame
  animateZoom(
    targetZoom: number,
    modelRef: any,
    onComplete?: () => void,
    onProgress?: (zoom: number) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isValidZoom(targetZoom) || this.zoomState.isAnimating) {
        resolve();
        return;
      }

      this.zoomState.isAnimating = true;
      const startZoom = this.zoomState.currentZoom;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / this.config.animationDuration, 1);

        // Easing function (ease-out)
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        const currentZoom =
          startZoom + (targetZoom - startZoom) * easedProgress;

        // Apply zoom to the 3D model
        if (modelRef && modelRef.organModel) {
          const scale = currentZoom;
          modelRef.organModel.scale.set(scale, scale, scale);
        }

        this.zoomState.currentZoom = currentZoom;

        // Call progress callback
        if (onProgress) {
          onProgress(currentZoom);
        }

        if (progress < 1) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          this.zoomState.isAnimating = false;
          this.animationFrameId = null;
          if (onComplete) onComplete();
          resolve();
        }
      };

      this.animationFrameId = requestAnimationFrame(animate);
    });
  }

  // Zoom in by one step
  async zoomIn(
    modelRef: any,
    onProgress?: (zoom: number) => void
  ): Promise<void> {
    const targetZoom = Math.min(
      this.zoomState.currentZoom + this.config.zoomStep,
      this.config.maxZoom
    );

    return this.animateZoom(targetZoom, modelRef, undefined, onProgress);
  }

  // Zoom out by one step
  async zoomOut(
    modelRef: any,
    onProgress?: (zoom: number) => void
  ): Promise<void> {
    const targetZoom = Math.max(
      this.zoomState.currentZoom - this.config.zoomStep,
      this.config.minZoom
    );

    return this.animateZoom(targetZoom, modelRef, undefined, onProgress);
  }

  // Set zoom to specific level
  async setZoom(
    targetZoom: number,
    modelRef: any,
    onProgress?: (zoom: number) => void
  ): Promise<void> {
    return this.animateZoom(targetZoom, modelRef, undefined, onProgress);
  }

  // Get current view state based on zoom level
  getCurrentViewState(): "normal" | "slicing" | "labeled" | "detailed" {
    const zoom = this.zoomState.currentZoom;

    if (zoom >= this.zoomState.thresholds.maxDetail) {
      return "detailed";
    } else if (zoom >= this.zoomState.thresholds.showLabels) {
      return "labeled";
    } else if (zoom >= this.zoomState.thresholds.startSlicing) {
      return "slicing";
    } else {
      return "normal";
    }
  }

  // Handle pinch gesture for mobile devices
  handlePinchGesture(
    touches: TouchList,
    modelRef: any,
    onProgress?: (zoom: number) => void
  ): void {
    if (touches.length !== 2 || this.zoomState.isAnimating) return;

    const touch1 = touches[0];
    const touch2 = touches[1];

    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );

    // Store initial distance on first pinch
    if (!this.pinchState) {
      this.pinchState = {
        initialDistance: distance,
        baseZoom: this.zoomState.currentZoom,
      };
      return;
    }

    // Calculate zoom based on pinch distance change
    const scale = distance / this.pinchState.initialDistance;
    const targetZoom = Math.max(
      this.config.minZoom,
      Math.min(this.config.maxZoom, this.pinchState.baseZoom * scale)
    );

    // Apply zoom immediately for smooth pinch experience
    this.zoomState.currentZoom = targetZoom;

    if (modelRef && modelRef.organModel) {
      modelRef.organModel.scale.set(targetZoom, targetZoom, targetZoom);
    }

    if (onProgress) {
      onProgress(targetZoom);
    }
  }

  private pinchState: { initialDistance: number; baseZoom: number } | null =
    null;

  // Reset pinch state
  resetPinchState(): void {
    this.pinchState = null;
  }

  // Cancel any ongoing animation
  cancelAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      this.zoomState.isAnimating = false;
    }
  }

  // Reset zoom to default
  async resetZoom(
    modelRef: any,
    onProgress?: (zoom: number) => void
  ): Promise<void> {
    return this.animateZoom(1.0, modelRef, undefined, onProgress);
  }

  // Cleanup method
  destroy(): void {
    this.cancelAnimation();
    this.resetPinchState();
  }
}
