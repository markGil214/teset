// Heart anatomical data and slicing configurations for AR Heart Visualization System
// Contains heart part definitions, slicing animations, and anatomical information

import type { 
  HeartPart, 
  HeartSlicingConfig, 
  HeartLabel, 
  MobileOptimizationConfig 
} from '../../types/HeartTypes';

// Default heart parts configuration - maps anatomical structures to 3D model elements
export const DEFAULT_HEART_PARTS: HeartPart[] = [
  // Main chambers
  {
    id: 'left-atrium',
    name: 'Left Atrium',
    selector: '[data-part="left-atrium"], .left-atrium, #leftAtrium',
    anatomicalType: 'chamber',
    isVisible: true,
    sliceDirection: { x: -0.3, y: 0.2, z: 0.1 },
    sliceDistance: 0.8,
    animationDelay: 0
  },
  {
    id: 'right-atrium',
    name: 'Right Atrium',
    selector: '[data-part="right-atrium"], .right-atrium, #rightAtrium',
    anatomicalType: 'chamber',
    isVisible: true,
    sliceDirection: { x: 0.3, y: 0.2, z: 0.1 },
    sliceDistance: 0.8,
    animationDelay: 100
  },
  {
    id: 'left-ventricle',
    name: 'Left Ventricle',
    selector: '[data-part="left-ventricle"], .left-ventricle, #leftVentricle',
    anatomicalType: 'chamber',
    isVisible: true,
    sliceDirection: { x: -0.4, y: -0.3, z: 0.2 },
    sliceDistance: 1.0,
    animationDelay: 200
  },
  {
    id: 'right-ventricle',
    name: 'Right Ventricle',
    selector: '[data-part="right-ventricle"], .right-ventricle, #rightVentricle',
    anatomicalType: 'chamber',
    isVisible: true,
    sliceDirection: { x: 0.4, y: -0.3, z: 0.2 },
    sliceDistance: 1.0,
    animationDelay: 250
  },
  
  // Major valves
  {
    id: 'mitral-valve',
    name: 'Mitral Valve',
    selector: '[data-part="mitral-valve"], .mitral-valve, #mitralValve',
    anatomicalType: 'valve',
    isVisible: true,
    sliceDirection: { x: -0.2, y: 0, z: 0.3 },
    sliceDistance: 0.6,
    animationDelay: 300
  },
  {
    id: 'tricuspid-valve',
    name: 'Tricuspid Valve',
    selector: '[data-part="tricuspid-valve"], .tricuspid-valve, #tricuspidValve',
    anatomicalType: 'valve',
    isVisible: true,
    sliceDirection: { x: 0.2, y: 0, z: 0.3 },
    sliceDistance: 0.6,
    animationDelay: 350
  },
  {
    id: 'aortic-valve',
    name: 'Aortic Valve',
    selector: '[data-part="aortic-valve"], .aortic-valve, #aorticValve',
    anatomicalType: 'valve',
    isVisible: true,
    sliceDirection: { x: -0.1, y: 0.4, z: 0.2 },
    sliceDistance: 0.5,
    animationDelay: 400
  },
  {
    id: 'pulmonary-valve',
    name: 'Pulmonary Valve',
    selector: '[data-part="pulmonary-valve"], .pulmonary-valve, #pulmonaryValve',
    anatomicalType: 'valve',
    isVisible: true,
    sliceDirection: { x: 0.1, y: 0.4, z: 0.2 },
    sliceDistance: 0.5,
    animationDelay: 450
  },
  
  // Major vessels
  {
    id: 'aorta',
    name: 'Aorta',
    selector: '[data-part="aorta"], .aorta, #aorta',
    anatomicalType: 'vessel',
    isVisible: true,
    sliceDirection: { x: -0.2, y: 0.5, z: 0 },
    sliceDistance: 0.7,
    animationDelay: 500
  },
  {
    id: 'pulmonary-artery',
    name: 'Pulmonary Artery',
    selector: '[data-part="pulmonary-artery"], .pulmonary-artery, #pulmonaryArtery',
    anatomicalType: 'vessel',
    isVisible: true,
    sliceDirection: { x: 0.2, y: 0.5, z: 0 },
    sliceDistance: 0.7,
    animationDelay: 550
  },
  {
    id: 'vena-cava',
    name: 'Vena Cava',
    selector: '[data-part="vena-cava"], .vena-cava, #venaCava',
    anatomicalType: 'vessel',
    isVisible: true,
    sliceDirection: { x: 0.3, y: 0.3, z: -0.1 },
    sliceDistance: 0.8,
    animationDelay: 600
  },
  
  // Specialized structures
  {
    id: 'septum',
    name: 'Interventricular Septum',
    selector: '[data-part="septum"], .septum, #septum',
    anatomicalType: 'septum',
    isVisible: true,
    sliceDirection: { x: 0, y: 0, z: 0.4 },
    sliceDistance: 0.9,
    animationDelay: 650
  },
  {
    id: 'coronary-arteries',
    name: 'Coronary Arteries',
    selector: '[data-part="coronary-arteries"], .coronary-arteries, #coronaryArteries',
    anatomicalType: 'vessel',
    isVisible: true,
    sliceDirection: { x: 0, y: 0, z: -0.3 },
    sliceDistance: 0.4,
    animationDelay: 700
  }
];

// Heart slicing animation configuration
export const DEFAULT_SLICING_CONFIG: HeartSlicingConfig = {
  zoomThreshold: 1.5,
  animationDuration: 2000,
  staggerDelay: 50,
  easing: 'power2.inOut',
  maxSliceDistance: 1.2,
  enableMobileOptimizations: true,
  enableDebugMode: false
};

// Anatomical labels for educational display
export const DEFAULT_HEART_LABELS: HeartLabel[] = [
  {
    id: 'label-left-atrium',
    text: 'Left Atrium',
    anatomicalName: 'Receives oxygenated blood from lungs',
    position: { x: -0.5, y: 0.3, z: 0 },
    isVisible: false,
    targetPartId: 'left-atrium'
  },
  {
    id: 'label-right-atrium',
    text: 'Right Atrium',
    anatomicalName: 'Receives deoxygenated blood from body',
    position: { x: 0.5, y: 0.3, z: 0 },
    isVisible: false,
    targetPartId: 'right-atrium'
  },
  {
    id: 'label-left-ventricle',
    text: 'Left Ventricle',
    anatomicalName: 'Pumps oxygenated blood to body',
    position: { x: -0.6, y: -0.4, z: 0 },
    isVisible: false,
    targetPartId: 'left-ventricle'
  },
  {
    id: 'label-right-ventricle',
    text: 'Right Ventricle',
    anatomicalName: 'Pumps deoxygenated blood to lungs',
    position: { x: 0.6, y: -0.4, z: 0 },
    isVisible: false,
    targetPartId: 'right-ventricle'
  },
  {
    id: 'label-aorta',
    text: 'Aorta',
    anatomicalName: 'Main artery carrying blood from heart',
    position: { x: -0.3, y: 0.5, z: 0 },
    isVisible: false,
    targetPartId: 'aorta'
  },
  {
    id: 'label-septum',
    text: 'Septum',
    anatomicalName: 'Wall separating left and right sides',
    position: { x: -0.4, y: 0, z: 0 },
    isVisible: false,
    targetPartId: 'septum'
  }
];

// Mobile optimization settings
export const MOBILE_OPTIMIZATION_CONFIG: MobileOptimizationConfig = {
  reducedAnimationDuration: 1500,
  simplifiedEasing: 'ease-in-out',
  maxConcurrentAnimations: 4,
  lowEndDeviceDetection: true,
  adaptiveQuality: true,
  pauseOnBackgroundTab: true,
  reducedFrameRate: 30
};

// Utility functions for heart data management
export function getHeartPartById(partId: string): HeartPart | undefined {
  return DEFAULT_HEART_PARTS.find(part => part.id === partId);
}

export function getHeartPartsByType(anatomicalType: string): HeartPart[] {
  return DEFAULT_HEART_PARTS.filter(part => part.anatomicalType === anatomicalType);
}

// Advanced slicing configuration for different visualization modes
export const ADVANCED_SLICING_CONFIG: HeartSlicingConfig = {
  ...DEFAULT_SLICING_CONFIG,
  zoomThreshold: 1.3,
  animationDuration: 2500,
  maxSliceDistance: 1.5,
  enableDebugMode: true
};

// Performance-optimized configuration for mobile devices
export const MOBILE_SLICING_CONFIG: HeartSlicingConfig = {
  ...DEFAULT_SLICING_CONFIG,
  animationDuration: 1500,
  maxSliceDistance: 0.8,
  enableMobileOptimizations: true
};

// Function to detect educational context and return appropriate configuration
export function getEducationalConfiguration(heartEntity?: Element): HeartSlicingConfig {
  if (!heartEntity) {
    return DEFAULT_SLICING_CONFIG;
  }
  
  const classList = Array.from(heartEntity.classList || []);
  
  // Check for educational context indicators
  const isEducational = classList.some(cls => 
    typeof cls === 'string' && (cls.includes('educational') || cls.includes('learning'))
  );
  
  const isAdvanced = classList.some(cls => 
    typeof cls === 'string' && cls.includes('advanced')
  );
  
  if (isAdvanced) {
    return ADVANCED_SLICING_CONFIG;
  }
  
  if (isEducational) {
    return {
      ...DEFAULT_SLICING_CONFIG,
      enableDebugMode: true,
      animationDuration: 3000,
      staggerDelay: 100
    };
  }
  
  return DEFAULT_SLICING_CONFIG;
}

// Fallback heart parts configuration for when main parts can't be found
export const FALLBACK_HEART_PARTS: HeartPart[] = [
  {
    id: 'heart-main',
    name: 'Heart',
    selector: '[data-part="heart"], .heart, #heart',
    anatomicalType: 'organ',
    isVisible: true,
    sliceDirection: { x: 0, y: 0, z: 0.5 },
    sliceDistance: 1.0
  }
];

// Optimized configuration getter for different device types
export function getOptimizedConfig(heartEntity?: any): HeartSlicingConfig {
  // Check device capabilities
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
  
  if (isMobile || isLowEndDevice) {
    return MOBILE_SLICING_CONFIG;
  }
  
  return getEducationalConfiguration(heartEntity);
}
