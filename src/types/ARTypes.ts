// AR-specific type definitions for the heart visualization system

export interface ZoomState {
  currentZoom: number; // 0.5x to 3.0x range
  isAnimating: boolean; // Animation lock to prevent conflicts
  thresholds: {
    normalView: number; // Default heart view (1.0)
    startSlicing: number; // Begin heart separation (1.5)
    showLabels: number; // Display anatomical labels (2.0)
    maxDetail: number; // Full medical information (2.5)
  };
}

export interface TouchState {
  isPinching: boolean;
  initialDistance: number;
  baseZoom: number;
  lastTouchTime: number;
}

export interface ARControlsProps {
  currentZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isAnimating: boolean;
  disabled?: boolean;
}

export interface ModelReference {
  markerGroup: any; // THREE.Group containing the heart model
  organModel: any; // The actual heart 3D model
  renderer: any; // THREE.WebGLRenderer
  scene: any; // THREE.Scene
  camera: any; // THREE.Camera
  controller: any; // THREEAR controller
  source: any; // THREEAR source
}

export interface ZoomConfig {
  minZoom: number;
  maxZoom: number;
  zoomStep: number;
  animationDuration: number;
  easing: string;
}

// Animation states for the heart model
export type HeartViewState = "normal" | "slicing" | "labeled" | "detailed";

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}
