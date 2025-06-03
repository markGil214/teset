// Heart-specific TypeScript interfaces for AR visualization
import * as THREE from 'three';

export interface HeartPart {
  id: string;
  name: string;
  displayName: string;
  meshName?: string; // Name in the GLTF model
  position: THREE.Vector3;
  separatedPosition: THREE.Vector3; // Position when heart is "sliced"
  description: string;
  function: string;
  diseases: string[];
  color?: string;
  visible: boolean;
}

export interface HeartAnimationState {
  isSlicing: boolean;
  isSliced: boolean;
  isReassembling: boolean;
  animationProgress: number; // 0 to 1
  currentZoomLevel: number;
  activeLabels: string[];
}

export interface HeartSlicingConfig {
  sliceThreshold: number; // Zoom level to start slicing
  labelThreshold: number; // Zoom level to show labels
  animationDuration: number; // milliseconds
  separationDistance: number; // How far apart to move pieces
  easingFunction: string; // GSAP easing
}

export interface HeartLabel {
  id: string;
  heartPartId: string;
  text: string;
  position: THREE.Vector3;
  arrowTarget: THREE.Vector3;
  visible: boolean;
  htmlElement?: HTMLElement;
}

export interface HeartDisease {
  id: string;
  name: string;
  category: "structural" | "rhythm" | "vascular" | "infection" | "congenital";
  severity: "mild" | "moderate" | "severe" | "critical";
  symptoms: string[];
  causes: string[];
  prevention: string[];
  treatment: string[];
  prevalence: string;
  ageGroup: string;
  affectedParts: string[]; // HeartPart IDs
  description: string;
  riskFactors: string[];
}

export interface HeartEducationContent {
  facts: string[];
  tips: string[];
  myths: string[];
  statistics: {
    label: string;
    value: string;
    source: string;
  }[];
}

// Animation callback types
export type HeartAnimationCallback = (progress: number) => void;
export type HeartSliceCompleteCallback = (isSliced: boolean) => void;
export type HeartPartClickCallback = (part: HeartPart) => void;
