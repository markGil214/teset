// Heart-specific TypeScript interfaces for AR Heart Visualization System Phase 2
// Defines types for heart slicing animations, anatomical parts, and performance monitoring

// Simple 3D vector interface (not dependent on THREE.js)
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Simple 3D euler rotation interface
export interface Euler {
  x: number;
  y: number;
  z: number;
}

// Entity type for A-Frame elements
export interface Entity extends HTMLElement {
  object3D?: any;
  components?: any;
}

// Heart anatomical parts that can be animated/sliced
export interface HeartPart {  id: string;
  name: string;
  selector: string; // CSS selector to find the part in the 3D model
  anatomicalType: 'chamber' | 'valve' | 'vessel' | 'wall' | 'septum' | 'organ';
  isVisible: boolean;
  originalPosition?: Vector3;
  originalRotation?: Euler;
  originalScale?: Vector3;
  sliceDirection?: Vector3; // Direction to move when slicing
  sliceDistance?: number; // Distance to move when slicing
  animationDelay?: number; // Delay before starting animation (in ms)
}

// Animation states for heart slicing
export enum HeartAnimationState {
  IDLE = 'idle',
  SLICING = 'slicing', // Parts moving apart
  SLICED = 'sliced', // Parts fully separated
  REASSEMBLING = 'reassembling', // Parts moving back together
  ASSEMBLED = 'assembled' // Parts back in original position
}

// Configuration for heart slicing behavior
export interface HeartSlicingConfig {
  zoomThreshold: number; // Zoom level that triggers slicing (e.g., 1.5)
  animationDuration: number; // Duration of slicing animation in ms
  staggerDelay: number; // Delay between each part's animation
  easing: string; // CSS/GSAP easing function
  maxSliceDistance: number; // Maximum distance parts can move
  enableMobileOptimizations: boolean;
  enableDebugMode: boolean;
}

// Heart animation controller state
export interface HeartAnimationControllerState {
  currentZoom: number;
  animationState: HeartAnimationState;
  heartParts: HeartPart[];
  isInitialized: boolean;
  isAnimating: boolean;
  config: HeartSlicingConfig;
  heartEntity?: Entity;
  performanceMode: 'high' | 'medium' | 'low';
}

// Performance monitoring data
export interface PerformanceMetrics {
  fps: number;
  frameTime: number; // in milliseconds
  memoryUsage: number; // in MB
  renderCalls: number;
  triangleCount: number;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  webglSupported: boolean;
  isLowEndDevice: boolean;
}

// Heart label data for anatomical information
export interface HeartLabel {
  id: string;
  text: string;
  anatomicalName: string;
  position: Vector3;
  targetPartId: string; // ID of the heart part this label points to
  isVisible: boolean;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
}

// Animation events that can be listened to
export interface HeartAnimationEvent {
  type: 'slicing-start' | 'slicing-complete' | 'reassemble-start' | 'reassemble-complete' | 'performance-warning';
  data?: {
    animationState?: HeartAnimationState;
    zoomLevel?: number;
    performanceMetrics?: PerformanceMetrics;
    affectedParts?: string[]; // IDs of heart parts involved
  };
}

// Heart model analysis results
export interface HeartModelAnalysis {
  totalParts: number;
  identifiedChambers: string[];
  identifiedValves: string[];
  identifiedVessels: string[];
  sliceableElements: number;
  modelComplexity: 'low' | 'medium' | 'high';
  recommendedPerformanceMode: 'high' | 'medium' | 'low';
  hasRequiredParts: boolean;
  missingParts: string[];
}

// Configuration for mobile optimization
export interface MobileOptimizationConfig {
  reducedAnimationDuration: number;
  simplifiedEasing: string;
  maxConcurrentAnimations: number;
  lowEndDeviceDetection: boolean;
  adaptiveQuality: boolean;
  pauseOnBackgroundTab: boolean;
  reducedFrameRate: number;
}

// Debug information for development
export interface HeartDebugInfo {
  modelInfo: HeartModelAnalysis;
  performanceMetrics: PerformanceMetrics;
  currentAnimationState: HeartAnimationState;
  activeAnimations: number;
  heartPartsStatus: { [partId: string]: { visible: boolean; position: Vector3 } };
  configOverrides: Partial<HeartSlicingConfig>;
}

// Callback types for heart animation events
export type HeartAnimationCallback = (event: HeartAnimationEvent) => void;
export type PerformanceUpdateCallback = (metrics: PerformanceMetrics) => void;

// Extended THREE.js types for better type safety
declare global {
  namespace THREE {
    interface Vector3 {
      clone(): Vector3;
      copy(v: Vector3): Vector3;
    }
    
    interface Euler {
      clone(): Euler;
      copy(e: Euler): Euler;
    }
  }
}

export default {};