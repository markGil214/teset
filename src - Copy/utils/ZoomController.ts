import { ZoomState, ZoomThresholds, TouchState } from "../types/ZoomTypes";

export class ZoomController {
  private zoomState: ZoomState;
  private touchState: TouchState;
  private callbacks: {
    onZoomChange?: (zoom: number) => void;
    onThresholdCrossed?: (
      threshold: keyof ZoomThresholds,
      zoom: number
    ) => void;
    onMaxZoomReached?: () => void;
  };

  constructor(
    initialZoom: number = 1.0,
    callbacks: {
      onZoomChange?: (zoom: number) => void;
      onThresholdCrossed?: (
        threshold: keyof ZoomThresholds,
        zoom: number
      ) => void;
      onMaxZoomReached?: () => void;
    } = {}
  ) {
    this.zoomState = {
      currentZoom: initialZoom,
      isAnimating: false,
      thresholds: {
        normalView: 1.0,
        startSlicing: 1.5,
        showLabels: 2.0,
        maxDetail: 2.5,
      },
    };

    this.touchState = {
      isPinching: false,
      initialDistance: 0,
      baseZoom: initialZoom,
      lastTouchTime: 0,
    };

    this.callbacks = callbacks;
  }

  // Get current zoom level
  getCurrentZoom(): number {
    return this.zoomState.currentZoom;
  }

  // Check if zooming is currently animating
  isAnimating(): boolean {
    return this.zoomState.isAnimating;
  } // Set zoom level with validation
  setZoom(zoom: number, animate: boolean = true): void {
    const clampedZoom = Math.max(0.5, Math.min(3.0, zoom));

    console.log(
      `ZoomController.setZoom - requested: ${zoom}, clamped: ${clampedZoom}, current: ${this.zoomState.currentZoom}`
    );

    // Check if user tried to zoom beyond maximum
    if (zoom > 3.0 && this.zoomState.currentZoom === 3.0) {
      console.log("Max zoom reached - triggering callback");
      this.callbacks.onMaxZoomReached?.();
    }

    if (clampedZoom === this.zoomState.currentZoom) {
      console.log("Zoom unchanged, skipping");
      return;
    }

    // Check for threshold crossings
    this.checkThresholdCrossings(this.zoomState.currentZoom, clampedZoom);

    this.zoomState.currentZoom = clampedZoom;

    if (animate) {
      console.log("Starting zoom animation to", clampedZoom);
      this.animateZoom(clampedZoom);
    } else {
      console.log("Applying zoom immediately to", clampedZoom);
      this.callbacks.onZoomChange?.(clampedZoom);
    }
  }
  // Zoom in by step
  zoomIn(step: number = 0.2): void {
    console.log(
      `ZoomController.zoomIn called - current: ${this.zoomState.currentZoom}, animating: ${this.zoomState.isAnimating}`
    );
    if (this.zoomState.isAnimating) {
      console.log("Zoom in blocked - animation in progress");
      return;
    }
    const newZoom = this.zoomState.currentZoom + step;
    console.log(`Zooming in from ${this.zoomState.currentZoom} to ${newZoom}`);
    this.setZoom(newZoom);
  }

  // Zoom out by step
  zoomOut(step: number = 0.2): void {
    console.log(
      `ZoomController.zoomOut called - current: ${this.zoomState.currentZoom}, animating: ${this.zoomState.isAnimating}`
    );
    if (this.zoomState.isAnimating) {
      console.log("Zoom out blocked - animation in progress");
      return;
    }
    const newZoom = this.zoomState.currentZoom - step;
    console.log(`Zooming out from ${this.zoomState.currentZoom} to ${newZoom}`);
    this.setZoom(newZoom);
  }

  // Handle touch start event
  handleTouchStart(event: TouchEvent): void {
    if (event.touches.length === 2) {
      this.touchState.isPinching = true;
      this.touchState.initialDistance = this.getDistance(
        event.touches[0],
        event.touches[1]
      );
      this.touchState.baseZoom = this.zoomState.currentZoom;
      this.touchState.lastTouchTime = Date.now();
    }
  }

  // Handle touch move event
  handleTouchMove(event: TouchEvent): void {
    if (this.touchState.isPinching && event.touches.length === 2) {
      event.preventDefault(); // Prevent default browser zoom

      const currentDistance = this.getDistance(
        event.touches[0],
        event.touches[1]
      );
      const scale = currentDistance / this.touchState.initialDistance;
      const newZoom = this.touchState.baseZoom * scale;

      this.setZoom(newZoom, false); // Don't animate during pinch
    }
  }

  // Handle touch end event
  handleTouchEnd(event: TouchEvent): void {
    if (event.touches.length < 2) {
      this.touchState.isPinching = false;
      this.touchState.initialDistance = 0;
    }
  }

  // Get distance between two touch points
  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  } // Animate zoom change
  private animateZoom(targetZoom: number): void {
    this.zoomState.isAnimating = true;

    const startZoom = this.zoomState.currentZoom;
    const duration = 300; // ms
    const startTime = Date.now();

    console.log(`Starting animation from ${startZoom} to ${targetZoom}`);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentZoom = startZoom + (targetZoom - startZoom) * easeOut;

      console.log(
        `Animation progress: ${(progress * 100).toFixed(
          1
        )}%, zoom: ${currentZoom.toFixed(2)}`
      );

      this.callbacks.onZoomChange?.(currentZoom);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Ensure final zoom is exactly the target
        this.zoomState.currentZoom = targetZoom;
        this.callbacks.onZoomChange?.(targetZoom);
        this.zoomState.isAnimating = false;
        console.log(`Animation complete at ${targetZoom}x`);
      }
    };

    requestAnimationFrame(animate);
  }

  // Check if zoom level crosses any thresholds
  private checkThresholdCrossings(oldZoom: number, newZoom: number): void {
    const thresholds = this.zoomState.thresholds;

    Object.entries(thresholds).forEach(([key, value]) => {
      const thresholdKey = key as keyof ZoomThresholds;

      // Check if we're crossing the threshold in either direction
      if (
        (oldZoom < value && newZoom >= value) ||
        (oldZoom >= value && newZoom < value)
      ) {
        this.callbacks.onThresholdCrossed?.(thresholdKey, newZoom);
      }
    });
  }

  // Reset zoom to normal view
  resetZoom(): void {
    this.setZoom(this.zoomState.thresholds.normalView);
  }

  // Get all threshold values
  getThresholds(): ZoomThresholds {
    return { ...this.zoomState.thresholds };
  }

  // Update threshold values
  updateThresholds(newThresholds: Partial<ZoomThresholds>): void {
    this.zoomState.thresholds = {
      ...this.zoomState.thresholds,
      ...newThresholds,
    };
  }

  // Cleanup method
  destroy(): void {
    this.zoomState.isAnimating = false;
    this.touchState.isPinching = false;
  }
}
