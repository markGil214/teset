// Heart Animation Controller for AR Heart Visualization System Phase 2
// Handles heart slicing animations triggered by zoom levels with performance optimizations

import { 
  HeartPart, 
  HeartAnimationState, 
  HeartSlicingConfig,
  HeartAnimationControllerState,
  HeartAnimationEvent,
  HeartAnimationCallback,
  HeartModelAnalysis,
  Entity
} from '../types/HeartTypes';

import { 
  DEFAULT_HEART_PARTS, 
  DEFAULT_SLICING_CONFIG,
  FALLBACK_HEART_PARTS,
  getOptimizedConfig
} from '../assets/components/HeartData';

// Declare global variables for the libraries
declare global {
  interface Window {
    THREE: any;
    gsap: any;
  }
}

export class HeartAnimationController {
  private state: HeartAnimationControllerState;
  private callbacks: HeartAnimationCallback[] = [];
  private animationTimeline: any = null; // GSAP timeline
  private isGSAPAvailable: boolean = false;
  private resizeObserver: ResizeObserver | null = null;
  private visibilityChangeHandler: (() => void) | null = null;

  constructor(heartEntity: Entity, config?: Partial<HeartSlicingConfig>) {
    // Initialize state
    this.state = {
      currentZoom: 1.0,
      animationState: HeartAnimationState.IDLE,
      heartParts: [],
      isInitialized: false,
      isAnimating: false,
      config: { ...DEFAULT_SLICING_CONFIG, ...config },
      heartEntity,
      performanceMode: 'high'
    };

    // Check for GSAP availability
    this.checkGSAPAvailability();
    
    // Initialize the controller
    this.initialize();
  }

  /**
   * Initialize the heart animation controller
   */
  private async initialize(): Promise<void> {
    try {
      console.log('HeartAnimationController: Initializing...');
      
      // Analyze the heart model structure
      const modelAnalysis = await this.analyzeHeartModel();
      console.log('Heart model analysis:', modelAnalysis);
      
      // Set performance mode based on device capabilities
      this.setPerformanceMode();
      
      // Initialize heart parts
      await this.initializeHeartParts(modelAnalysis);
      
      // Setup performance monitoring
      if (this.state.config.enableDebugMode) {
        this.setupPerformanceMonitoring();
      }
      
      // Setup visibility and resize handlers
      this.setupEventHandlers();
      
      this.state.isInitialized = true;
      console.log('HeartAnimationController: Initialization complete');
      
      // Emit initialization event
      this.emitEvent({
        type: 'slicing-complete',
        data: { animationState: HeartAnimationState.IDLE }
      });
      
    } catch (error) {
      console.error('HeartAnimationController: Initialization failed:', error);
      // Use fallback configuration
      this.initializeFallback();
    }
  }
  /**
   * Check if GSAP is available for animations
   */
  private checkGSAPAvailability(): void {
    try {
      this.isGSAPAvailable = typeof window.gsap !== 'undefined' && window.gsap.timeline;
      console.log('GSAP availability:', this.isGSAPAvailable);
    } catch (error) {
      console.warn('GSAP not available, using fallback animations:', error);
      this.isGSAPAvailable = false;
    }
  }

  /**
   * Analyze the heart model to identify parts and structure
   */
  private async analyzeHeartModel(): Promise<HeartModelAnalysis> {
    const analysis: HeartModelAnalysis = {
      totalParts: 0,
      identifiedChambers: [],
      identifiedValves: [],
      identifiedVessels: [],
      sliceableElements: 0,
      modelComplexity: 'low',
      recommendedPerformanceMode: 'high',
      hasRequiredParts: false,
      missingParts: []
    };

    if (!this.state.heartEntity) {
      return analysis;
    }

    try {
      // Get all child elements of the heart model
      const children = this.state.heartEntity.querySelectorAll('*');
      analysis.totalParts = children.length;      // Analyze each part
      children.forEach((element: Element) => {
        const id = element.id;

        // Check for chambers
        if (this.isPartType(element, 'chamber')) {
          analysis.identifiedChambers.push(id || element.tagName);
        }

        // Check for valves
        if (this.isPartType(element, 'valve')) {
          analysis.identifiedValves.push(id || element.tagName);
        }

        // Check for vessels
        if (this.isPartType(element, 'vessel')) {
          analysis.identifiedVessels.push(id || element.tagName);
        }

        // Count sliceable elements
        if (element.getAttribute('position') || element.getAttribute('animation')) {
          analysis.sliceableElements++;
        }
      });

      // Determine model complexity
      if (analysis.totalParts > 50) {
        analysis.modelComplexity = 'high';
        analysis.recommendedPerformanceMode = 'medium';
      } else if (analysis.totalParts > 20) {
        analysis.modelComplexity = 'medium';
        analysis.recommendedPerformanceMode = 'high';
      }

      // Check if model has required parts
      analysis.hasRequiredParts = analysis.identifiedChambers.length >= 2;

      console.log('Heart model analysis complete:', analysis);
      return analysis;

    } catch (error) {
      console.error('Error analyzing heart model:', error);
      return analysis;
    }
  }

  /**
   * Check if an element represents a specific anatomical part type
   */
  private isPartType(element: Element, partType: string): boolean {
    const text = (element.className + ' ' + element.id + ' ' + element.tagName).toLowerCase();
    
    switch (partType) {
      case 'chamber':
        return /atrium|ventricle|chamber/.test(text);
      case 'valve':
        return /valve|mitral|tricuspid|aortic|pulmonary/.test(text);
      case 'vessel':
        return /artery|vein|aorta|vessel|vena/.test(text);
      default:
        return false;
    }
  }

  /**
   * Set performance mode based on device capabilities
   */
  private setPerformanceMode(): void {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEnd = this.detectLowEndDevice();
    
    if (isLowEnd) {
      this.state.performanceMode = 'low';
    } else if (isMobile) {
      this.state.performanceMode = 'medium';
    } else {
      this.state.performanceMode = 'high';
    }

    // Update configuration based on performance mode
    if (this.state.performanceMode !== 'high') {
      this.state.config = getOptimizedConfig(isMobile ? 'mobile' : 'tablet');
    }

    console.log('Performance mode set to:', this.state.performanceMode);
  }

  /**
   * Detect if device is low-end based on available APIs
   */
  private detectLowEndDevice(): boolean {
    // Check navigator.hardwareConcurrency (number of CPU cores)
    const cores = (navigator as any).hardwareConcurrency || 2;
    
    // Check device memory (if available)
    const memory = (navigator as any).deviceMemory || 4;
    
    // Check if WebGL context creation is slow
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    return cores <= 2 || memory < 2 || !gl;
  }

  /**
   * Initialize heart parts for animation
   */
  private async initializeHeartParts(analysis: HeartModelAnalysis): Promise<void> {
    this.state.heartParts = [];

    if (!this.state.heartEntity) {
      return;
    }

    // Use detected parts or fallback to default configuration
    const partsToUse = analysis.hasRequiredParts ? DEFAULT_HEART_PARTS : FALLBACK_HEART_PARTS;

    for (const partConfig of partsToUse) {
      try {
        const element = this.findPartElement(partConfig.selector);
        
        if (element) {
          const heartPart: HeartPart = {
            ...partConfig,
            originalPosition: this.getElementPosition(element),
            originalRotation: this.getElementRotation(element),
            originalScale: this.getElementScale(element)
          };

          this.state.heartParts.push(heartPart);
          console.log(`Initialized heart part: ${heartPart.name}`);
        } else {
          console.warn(`Heart part not found: ${partConfig.name} (${partConfig.selector})`);
        }
      } catch (error) {
        console.error(`Error initializing heart part ${partConfig.name}:`, error);
      }
    }

    console.log(`Initialized ${this.state.heartParts.length} heart parts`);
  }

  /**
   * Find an element in the heart model using CSS selectors
   */
  private findPartElement(selector: string): Element | null {
    if (!this.state.heartEntity) return null;

    // Try multiple selectors (split by comma)
    const selectors = selector.split(',').map(s => s.trim());
    
    for (const sel of selectors) {
      try {
        const element = this.state.heartEntity.querySelector(sel);
        if (element) return element;
      } catch (error) {
        console.warn(`Invalid selector: ${sel}`);
      }
    }

    return null;
  }
  /**
   * Get element's current position
   */
  private getElementPosition(element: Element): { x: number; y: number; z: number } {
    const position = element.getAttribute('position');
    if (position) {
      const [x, y, z] = position.split(' ').map(Number);
      return { x: x || 0, y: y || 0, z: z || 0 };
    }
    return { x: 0, y: 0, z: 0 };
  }

  /**
   * Get element's current rotation
   */
  private getElementRotation(element: Element): { x: number; y: number; z: number } {
    const rotation = element.getAttribute('rotation');
    if (rotation) {
      const [x, y, z] = rotation.split(' ').map(Number);
      return { x: x || 0, y: y || 0, z: z || 0 };
    }
    return { x: 0, y: 0, z: 0 };
  }

  /**
   * Get element's current scale
   */
  private getElementScale(element: Element): { x: number; y: number; z: number } {
    const scale = element.getAttribute('scale');
    if (scale) {
      const [x, y, z] = scale.split(' ').map(Number);
      return { x: x || 1, y: y || 1, z: z || 1 };
    }
    return { x: 1, y: 1, z: 1 };
  }

  /**
   * Initialize fallback configuration when model analysis fails
   */
  private initializeFallback(): void {
    console.warn('Using fallback heart animation configuration');
    
    this.state.heartParts = [...FALLBACK_HEART_PARTS];
    this.state.isInitialized = true;
    this.state.performanceMode = 'low';
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // This would integrate with PerformanceMonitor.ts
    console.log('Performance monitoring enabled');
  }

  /**
   * Setup event handlers for visibility and resize
   */
  private setupEventHandlers(): void {
    // Handle visibility change (pause animations when tab is not visible)
    this.visibilityChangeHandler = () => {
      if (document.hidden && this.state.isAnimating) {
        this.pauseAnimations();
      } else if (!document.hidden && this.state.animationState === HeartAnimationState.SLICING) {
        this.resumeAnimations();
      }
    };
    
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);

    // Handle window resize
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        // Recalculate positions if needed
        if (this.state.isInitialized && !this.state.isAnimating) {
          this.recalculatePositions();
        }
      });
      
      this.resizeObserver.observe(document.body);
    }
  }

  /**
   * Handle zoom level changes
   */
  public onZoomChange(zoomLevel: number): void {
    if (!this.state.isInitialized || this.state.isAnimating) {
      return;
    }

    this.state.currentZoom = zoomLevel;
    const threshold = this.state.config.zoomThreshold;

    // Check if we need to start slicing
    if (zoomLevel >= threshold && this.state.animationState === HeartAnimationState.IDLE) {
      this.startSlicing();
    }    // Check if we need to reassemble
    else if (zoomLevel < threshold && this.state.animationState === HeartAnimationState.SLICED) {
      this.startReassembly();
    }
  }

  /**
   * Start the heart slicing animation
   */
  private async startSlicing(): Promise<void> {
    if (this.state.isAnimating || this.state.animationState !== HeartAnimationState.IDLE) {
      return;
    }

    console.log('Starting heart slicing animation');
    this.state.isAnimating = true;
    this.state.animationState = HeartAnimationState.SLICING;

    this.emitEvent({
      type: 'slicing-start',
      data: { 
        animationState: HeartAnimationState.SLICING,
        zoomLevel: this.state.currentZoom,
        affectedParts: this.state.heartParts.map(p => p.id)
      }
    });

    try {
      if (this.isGSAPAvailable) {
        await this.animateWithGSAP('slice');
      } else {
        await this.animateWithCSS('slice');
      }

      this.state.animationState = HeartAnimationState.SLICED;
      this.emitEvent({
        type: 'slicing-complete',
        data: { animationState: HeartAnimationState.SLICED }
      });

    } catch (error) {
      console.error('Slicing animation failed:', error);
    } finally {
      this.state.isAnimating = false;
    }
  }

  /**
   * Start the heart reassembly animation
   */
  private async startReassembly(): Promise<void> {
    if (this.state.isAnimating || this.state.animationState !== HeartAnimationState.SLICED) {
      return;
    }

    console.log('Starting heart reassembly animation');
    this.state.isAnimating = true;
    this.state.animationState = HeartAnimationState.REASSEMBLING;

    this.emitEvent({
      type: 'reassemble-start',
      data: { 
        animationState: HeartAnimationState.REASSEMBLING,
        zoomLevel: this.state.currentZoom
      }
    });

    try {
      if (this.isGSAPAvailable) {
        await this.animateWithGSAP('reassemble');
      } else {
        await this.animateWithCSS('reassemble');
      }

      this.state.animationState = HeartAnimationState.IDLE;
      this.emitEvent({
        type: 'reassemble-complete',
        data: { animationState: HeartAnimationState.IDLE }
      });

    } catch (error) {
      console.error('Reassembly animation failed:', error);
    } finally {
      this.state.isAnimating = false;
    }
  }

  /**
   * Animate using GSAP library
   */
  private async animateWithGSAP(action: 'slice' | 'reassemble'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Clear any existing timeline
        if (this.animationTimeline) {
          this.animationTimeline.kill();
        }        this.animationTimeline = window.gsap.timeline({
          onComplete: resolve,
          onError: reject
        });

        // Animate each heart part
        this.state.heartParts.forEach((part) => {
          const element = this.findPartElement(part.selector);
          if (!element) return;

          const delay = (part.animationDelay || 0) / 1000; // Convert to seconds
          
          if (action === 'slice') {
            // Move parts away from center
            const targetPosition = this.calculateSlicePosition(part);
            
            this.animationTimeline.to(element, {
              duration: this.state.config.animationDuration / 1000,
              delay,
              ease: this.state.config.easing,
              attr: {
                position: `${targetPosition.x} ${targetPosition.y} ${targetPosition.z}`
              }
            }, 0);
            
          } else {
            // Move parts back to original position
            const originalPos = part.originalPosition || { x: 0, y: 0, z: 0 };
            
            this.animationTimeline.to(element, {
              duration: this.state.config.animationDuration / 1000,
              delay,
              ease: this.state.config.easing,
              attr: {
                position: `${originalPos.x} ${originalPos.y} ${originalPos.z}`
              }
            }, 0);
          }
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Animate using CSS animations (fallback)
   */
  private async animateWithCSS(action: 'slice' | 'reassemble'): Promise<void> {
    return new Promise((resolve) => {
      let completedAnimations = 0;
      const totalAnimations = this.state.heartParts.length;

      if (totalAnimations === 0) {
        resolve();
        return;
      }      this.state.heartParts.forEach((part) => {
        const element = this.findPartElement(part.selector);
        if (!element) {
          completedAnimations++;
          if (completedAnimations >= totalAnimations) resolve();
          return;
        }

        setTimeout(() => {
          const targetPosition = action === 'slice' 
            ? this.calculateSlicePosition(part)
            : (part.originalPosition || { x: 0, y: 0, z: 0 });

          // Apply CSS transition
          (element as HTMLElement).style.transition = `all ${this.state.config.animationDuration}ms ${this.state.config.easing}`;
          element.setAttribute('position', `${targetPosition.x} ${targetPosition.y} ${targetPosition.z}`);

          // Wait for animation to complete
          setTimeout(() => {
            completedAnimations++;
            if (completedAnimations >= totalAnimations) {
              resolve();
            }
          }, this.state.config.animationDuration);

        }, part.animationDelay || 0);
      });
    });
  }
  /**
   * Calculate the target position for a heart part when slicing
   */
  private calculateSlicePosition(part: HeartPart): { x: number; y: number; z: number } {
    const originalPos = part.originalPosition || { x: 0, y: 0, z: 0 };
    const sliceDir = part.sliceDirection || { x: 0, y: 0, z: 1 };
    const sliceDist = Math.min(part.sliceDistance || 1, this.state.config.maxSliceDistance);

    return {
      x: originalPos.x + (sliceDir.x * sliceDist),
      y: originalPos.y + (sliceDir.y * sliceDist),
      z: originalPos.z + (sliceDir.z * sliceDist)
    };
  }

  /**
   * Pause animations
   */
  private pauseAnimations(): void {
    if (this.animationTimeline && this.isGSAPAvailable) {
      this.animationTimeline.pause();
    }
  }

  /**
   * Resume animations
   */
  private resumeAnimations(): void {
    if (this.animationTimeline && this.isGSAPAvailable) {
      this.animationTimeline.resume();
    }
  }

  /**
   * Recalculate positions after window resize
   */
  private recalculatePositions(): void {
    // This could be implemented to adjust positions based on new viewport size
    console.log('Recalculating positions after resize');
  }

  /**
   * Add event listener
   */
  public addEventListener(callback: HeartAnimationCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(callback: HeartAnimationCallback): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent(event: HeartAnimationEvent): void {
    this.callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error calling animation callback:', error);
      }
    });
  }

  /**
   * Get current state (readonly)
   */
  public getState(): Readonly<HeartAnimationControllerState> {
    return { ...this.state };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<HeartSlicingConfig>): void {
    this.state.config = { ...this.state.config, ...newConfig };
    console.log('Heart animation configuration updated:', this.state.config);
  }

  /**
   * Force slicing (for manual testing)
   */
  public forceSlice(): void {
    if (this.state.animationState === HeartAnimationState.IDLE) {
      this.startSlicing();
    }
  }

  /**
   * Force reassembly (for manual testing)
   */
  public forceReassemble(): void {
    if (this.state.animationState === HeartAnimationState.SLICED) {
      this.startReassembly();
    }
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    console.log('HeartAnimationController: Disposing resources');

    // Clear animations
    if (this.animationTimeline) {
      this.animationTimeline.kill();
      this.animationTimeline = null;
    }

    // Remove event listeners
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // Clear callbacks
    this.callbacks = [];

    // Reset state
    this.state.isInitialized = false;
    this.state.isAnimating = false;
  }
}

export default HeartAnimationController;