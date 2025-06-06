export interface ZoomState {
  currentZoom: number; // 0.5x to 3.0x range
  isAnimating: boolean; // Animation lock
  thresholds: {
    normalView: number; // Default organ view
    startSlicing: number; // Begin organ separation (future feature)
    showLabels: number; // Display anatomical labels (future feature)  
    maxDetail: number; // Full medical information (future feature)
  };
}

export interface ZoomThresholds {
  normalView: number;
  startSlicing: number;
  showLabels: number;
  maxDetail: number;
}

export interface TouchState {
  isPinching: boolean;
  initialDistance: number;
  baseZoom: number;
  lastTouchTime: number;
}

export interface ZoomControlsProps {
  currentZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isAnimating: boolean;
  disabled?: boolean;
}
