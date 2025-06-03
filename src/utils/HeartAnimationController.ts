// Heart slicing animation controller for AR visualization
import * as THREE from 'three';
import { HeartAnimationState, HeartSlicingConfig } from '../types/HeartTypes';
import { heartParts, heartSlicingConfig } from '../assets/components/HeartData';

declare global {
  interface Window {
    gsap?: any;
  }
}

export class HeartAnimationController {
  private heartModel: THREE.Group | null = null;
  private heartParts: Map<string, THREE.Object3D> = new Map();
  private originalPositions: Map<string, THREE.Vector3> = new Map();
  private animationState: HeartAnimationState;
  private config: HeartSlicingConfig;
  private isSlicingEnabled: boolean = true;
  private callbacks: {
    onSliceStart?: () => void;
    onSliceComplete?: (isSliced: boolean) => void;
    onLabelShow?: (partId: string) => void;
  };

  constructor(
    config?: Partial<HeartSlicingConfig>,
    callbacks?: {
      onSliceStart?: () => void;
      onSliceComplete?: (isSliced: boolean) => void;
      onLabelShow?: (partId: string) => void;
    }
  ) {
    this.config = { ...heartSlicingConfig, ...config };
    this.callbacks = callbacks || {};
    
    this.animationState = {
      isSlicing: false,
      isSliced: false,
      isReassembling: false,
      animationProgress: 0,
      currentZoomLevel: 1.0,
      activeLabels: []
    };

    console.log('🫀 HeartAnimationController initialized with config:', this.config);
  }  // Initialize with the loaded heart model
  initializeHeartModel(model: THREE.Group): void {
    console.log('🫀 Initializing heart model for slicing animation...');
    this.heartModel = model;
    this.heartParts.clear();
    this.originalPositions.clear();

    // Find and map heart parts based on mesh names
    model.traverse((child) => {
      if ((child as any).isMesh || (child as any).isGroup) {
        const meshName = child.name;
        console.log(`Found mesh: "${meshName}"`);

        // Try to match mesh names with our heart parts data
        const heartPart = heartParts.find(part => 
          part.meshName && (
            meshName.toLowerCase().includes(part.meshName.toLowerCase()) ||
            part.meshName.toLowerCase().includes(meshName.toLowerCase())
          )
        );

        if (heartPart) {
          console.log(`✅ Mapped "${meshName}" to heart part: ${heartPart.name}`);
          this.heartParts.set(heartPart.id, child);
          this.originalPositions.set(heartPart.id, child.position.clone());
        } else {
          console.log(`⚠️ No mapping found for mesh: "${meshName}"`);
        }
      }
    });

    console.log(`🎯 Successfully mapped ${this.heartParts.size} heart parts:`, 
      Array.from(this.heartParts.keys()));

    // If we couldn't find specific parts, try different strategies
    if (this.heartParts.size === 0) {
      console.log('⚠️ No heart parts matched by name, trying fallback methods...');
      
      // Try to create simulated parts based on model structure
      this.createSimulatedHeartParts();
      
      // If that doesn't work either, create virtual parts
      if (this.heartParts.size === 0) {
        console.log('📦 Creating virtual separation points...');
        this.createVirtualHeartParts(model);
      }
    }
    
    // Apply optimizations based on device capabilities
    this.optimizeForDevice();
  }

  // Create virtual parts if the model doesn't have named components
  private createVirtualHeartParts(model: THREE.Group): void {
    console.log('Creating virtual heart parts for slicing demonstration...');
      // Find all mesh children
    const meshes: THREE.Mesh[] = [];
    model.traverse((child) => {
      if ((child as any).isMesh) {
        meshes.push(child as THREE.Mesh);
      }
    });

    if (meshes.length > 0) {
      // Create groups for different "sections" of the heart
      const sections = Math.min(4, meshes.length); // Up to 4 sections
      const meshesPerSection = Math.ceil(meshes.length / sections);

      for (let i = 0; i < sections; i++) {
        const sectionMeshes = meshes.slice(i * meshesPerSection, (i + 1) * meshesPerSection);
        const partId = `virtual_part_${i}`;
        
        // Create a group for this section
        const partGroup = new THREE.Group();
        partGroup.name = `VirtualHeartPart_${i}`;
        
        sectionMeshes.forEach(mesh => {
          partGroup.add(mesh.clone());
        });

        model.add(partGroup);
        this.heartParts.set(partId, partGroup);
        this.originalPositions.set(partId, partGroup.position.clone());
        
        console.log(`Created virtual heart part ${i} with ${sectionMeshes.length} meshes`);
      }
    }
  }

  // Create simulated heart parts from a complex heart model
  private createSimulatedHeartParts(): void {
    console.log('🫀 Creating simulated heart parts from actual model...');
    
    if (!this.heartModel) return;
    
    // Get model center and size for calculations
    const boundingBox = new THREE.Box3().setFromObject(this.heartModel);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    
    console.log(`Heart model size: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`);
    console.log(`Heart model center: ${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)}`);
    
    // Clean any existing parts
    this.heartParts.clear();
    this.originalPositions.clear();
    
    // Divide the model into logical sections based on anatomy
    const sections = [
      { id: 'upper_left', name: 'Left Atrium', position: new THREE.Vector3(-size.x/4, size.y/4, 0) },
      { id: 'upper_right', name: 'Right Atrium', position: new THREE.Vector3(size.x/4, size.y/4, 0) },
      { id: 'lower_left', name: 'Left Ventricle', position: new THREE.Vector3(-size.x/4, -size.y/4, 0) },
      { id: 'lower_right', name: 'Right Ventricle', position: new THREE.Vector3(size.x/4, -size.y/4, 0) },
      { id: 'top', name: 'Aorta', position: new THREE.Vector3(0, size.y/2, 0) },
    ];
    
    // Find meshes in each section
    const meshes: THREE.Mesh[] = [];
    this.heartModel.traverse((object) => {
      if ((object as any).isMesh) {
        meshes.push(object as THREE.Mesh);
      }
    });
      // Create a group for each section
    sections.forEach(section => {
      const group = new THREE.Group();
      group.name = section.name;
      
      // Calculate region bounds
      const sectionCenter = center.clone().add(section.position);
      const sectionRadius = Math.max(size.x, size.y) / 3;
      
      // Find meshes that belong to this section
      meshes.forEach(mesh => {
        // Clone the mesh to avoid affecting the original
        const clonedMesh = mesh.clone();
        
        // Calculate if this mesh is in this section's region
        const meshPosition = new THREE.Vector3();
        mesh.getWorldPosition(meshPosition);
        
        const distance = meshPosition.distanceTo(sectionCenter);
        
        // If close enough to this section's center, add it
        if (distance < sectionRadius) {
          group.add(clonedMesh);
        }
      });
      
      // Only add non-empty groups
      if (group.children.length > 0) {
        // Position at center of this section
        group.position.copy(sectionCenter);
        
        // Map to our heart parts structure
        const heartPartId = `simulated_${section.id}`;
        this.heartParts.set(heartPartId, group);
        this.originalPositions.set(heartPartId, group.position.clone());
        
        // Also map to a real heart part ID if possible
        const heartPart = heartParts.find(p => p.name.toLowerCase().includes(section.name.toLowerCase()));
        if (heartPart) {
          this.heartParts.set(heartPart.id, group);
          this.originalPositions.set(heartPart.id, group.position.clone());
        }
        
        console.log(`Created simulated heart part "${section.name}" with ${group.children.length} meshes`);
      }
    });
    
    console.log(`Created ${this.heartParts.size} simulated heart parts`);
  }

  // Handle zoom level changes and trigger appropriate animations
  handleZoomChange(zoomLevel: number): void {
    this.animationState.currentZoomLevel = zoomLevel;
    
    console.log(`🔍 Heart zoom level: ${zoomLevel.toFixed(2)}x`);

    // Check for slicing threshold
    if (zoomLevel >= this.config.sliceThreshold && !this.animationState.isSliced && 
        !this.animationState.isSlicing && this.isSlicingEnabled) {
      console.log(`🔪 Starting heart slicing animation at ${zoomLevel}x zoom`);
      this.startSlicingAnimation();
    }
    // Check for reassembly threshold
    else if (zoomLevel < this.config.sliceThreshold && this.animationState.isSliced && 
             !this.animationState.isReassembling) {
      console.log(`🔗 Starting heart reassembly animation at ${zoomLevel}x zoom`);
      this.startReassemblyAnimation();
    }
    // Check for label threshold
    else if (zoomLevel >= this.config.labelThreshold && this.animationState.isSliced) {
      console.log(`🏷️ Showing anatomical labels at ${zoomLevel}x zoom`);
      this.showAnatomicalLabels();
    }
    // Hide labels if zoom is too low
    else if (zoomLevel < this.config.labelThreshold) {
      this.hideAnatomicalLabels();
    }
  }  // Start the heart slicing animation
  private startSlicingAnimation(): void {
    if (this.animationState.isSlicing || this.animationState.isSliced) return;
    
    this.animationState.isSlicing = true;
    this.animationState.animationProgress = 0;
    this.callbacks.onSliceStart?.();

    // Capture performance data at start of animation
    this.capturePerformanceData('slice_start');

    console.log('🎬 Starting heart slicing animation...');
    console.log(`🔍 Heart parts found: ${this.heartParts.size}`);
    
    // Log parts that will be animated
    console.table(Array.from(this.heartParts.keys()).map(id => {
      const part = heartParts.find(p => p.id === id);
      return {
        id,
        name: part?.name || 'Virtual Part',
        found: !!part
      };
    }));
    
    // Animate each heart part to its separated position
    const animations: Promise<void>[] = [];
    
    this.heartParts.forEach((partObject, partId) => {
      const heartPart = heartParts.find(p => p.id === partId);
      if (!heartPart) return;

      const originalPos = this.originalPositions.get(partId);
      if (!originalPos) return;

      const targetPos = heartPart.separatedPosition.clone();
      
      // Create animation promise
      const animationPromise = new Promise<void>((resolve) => {
        // Check if GSAP is available, otherwise use basic animation
        if (window.gsap) {
          window.gsap.to(partObject.position, {
            duration: this.config.animationDuration / 1000,
            x: originalPos.x + targetPos.x,
            y: originalPos.y + targetPos.y, 
            z: originalPos.z + targetPos.z,
            ease: this.config.easingFunction,
            onComplete: resolve
          });
        } else {
          // Fallback animation without GSAP
          this.animatePosition(partObject, originalPos, targetPos, resolve);
        }
      });

      animations.push(animationPromise);
      
      console.log(`🎯 Animating ${heartPart.name} from ${originalPos.x.toFixed(2)}, ${originalPos.y.toFixed(2)}, ${originalPos.z.toFixed(2)} to separated position`);
    });    // Wait for all animations to complete
    Promise.all(animations).then(() => {
      this.animationState.isSlicing = false;
      this.animationState.isSliced = true;
      this.animationState.animationProgress = 1;
      
      // Capture performance data at end of animation
      this.capturePerformanceData('slice_complete');
      
      console.log('✅ Heart slicing animation completed');
      this.callbacks.onSliceComplete?.(true);
    });
  }
  // Start the heart reassembly animation
  private startReassemblyAnimation(): void {
    if (this.animationState.isReassembling || !this.animationState.isSliced) return;
    
    this.animationState.isReassembling = true;
    this.animationState.animationProgress = 1;
    
    // Capture performance data at start of reassembly
    this.capturePerformanceData('reassembly_start');
    
    console.log('🔄 Starting heart reassembly animation...');
    
    // Hide labels during reassembly
    this.hideAnatomicalLabels();
    
    // Animate each part back to original position
    const animations: Promise<void>[] = [];
    
    this.heartParts.forEach((partObject, partId) => {
      const originalPos = this.originalPositions.get(partId);
      if (!originalPos) return;

      const animationPromise = new Promise<void>((resolve) => {
        if (window.gsap) {
          window.gsap.to(partObject.position, {
            duration: this.config.animationDuration / 1000,
            x: originalPos.x,
            y: originalPos.y,
            z: originalPos.z,
            ease: this.config.easingFunction,
            onComplete: resolve
          });
        } else {
          // Fallback animation
          this.animatePositionBack(partObject, originalPos, resolve);
        }
      });

      animations.push(animationPromise);
    });    // Wait for all animations to complete
    Promise.all(animations).then(() => {
      this.animationState.isReassembling = false;
      this.animationState.isSliced = false;
      this.animationState.animationProgress = 0;
      
      // Capture performance data at end of reassembly
      this.capturePerformanceData('reassembly_complete');
      
      console.log('✅ Heart reassembly animation completed');
      this.callbacks.onSliceComplete?.(false);
    });
  }

  // Fallback position animation without GSAP
  private animatePosition(object: THREE.Object3D, originalPos: THREE.Vector3, targetPos: THREE.Vector3, onComplete: () => void): void {
    const startTime = Date.now();
    const duration = this.config.animationDuration;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out function
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      object.position.x = originalPos.x + (targetPos.x * easedProgress);
      object.position.y = originalPos.y + (targetPos.y * easedProgress);
      object.position.z = originalPos.z + (targetPos.z * easedProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };
    
    requestAnimationFrame(animate);
  }

  // Fallback animation back to original position
  private animatePositionBack(object: THREE.Object3D, originalPos: THREE.Vector3, onComplete: () => void): void {
    const startTime = Date.now();
    const duration = this.config.animationDuration;
    const startPos = object.position.clone();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out function
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      object.position.x = startPos.x + (originalPos.x - startPos.x) * easedProgress;
      object.position.y = startPos.y + (originalPos.y - startPos.y) * easedProgress;
      object.position.z = startPos.z + (originalPos.z - startPos.z) * easedProgress;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        object.position.copy(originalPos);
        onComplete();
      }
    };
    
    requestAnimationFrame(animate);
  }

  // Show anatomical labels
  private showAnatomicalLabels(): void {
    if (this.animationState.activeLabels.length > 0) return;
    
    console.log('🏷️ Showing anatomical labels...');
    
    // For now, just log which labels would be shown
    // In Phase 3, we'll create actual HTML labels
    this.heartParts.forEach((_, partId) => {
      const heartPart = heartParts.find(p => p.id === partId);
      if (heartPart) {
        this.animationState.activeLabels.push(partId);
        this.callbacks.onLabelShow?.(partId);
        console.log(`📋 Showing label for: ${heartPart.name}`);
      }
    });
  }

  // Hide anatomical labels
  private hideAnatomicalLabels(): void {
    if (this.animationState.activeLabels.length === 0) return;
    
    console.log('🫥 Hiding anatomical labels...');
    this.animationState.activeLabels = [];
  }

  // Get current animation state
  getAnimationState(): HeartAnimationState {
    return { ...this.animationState };
  }

  // Enable/disable slicing
  setSlicingEnabled(enabled: boolean): void {
    this.isSlicingEnabled = enabled;
    console.log(`🔪 Heart slicing ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Force slicing animation (for testing)
  forceSlice(): void {
    if (!this.animationState.isSliced) {
      console.log('🧪 Force triggering heart slicing animation...');
      this.startSlicingAnimation();
    }
  }

  // Force reassembly animation (for testing)
  forceReassemble(): void {
    if (this.animationState.isSliced) {
      console.log('🧪 Force triggering heart reassembly animation...');
      this.startReassemblyAnimation();
    }
  }

  // Get the heart model for external access
  getHeartModel(): THREE.Group | null {
    return this.heartModel;
  }
  // Cleanup
  destroy(): void {
    console.log('🧹 Cleaning up HeartAnimationController...');
    
    // Clean up animation resources first
    this.cleanupResources();
    
    // Clear all part references
    this.heartParts.clear();
    this.originalPositions.clear();
    this.heartModel = null;
    this.animationState.activeLabels = [];
    
    // Reset animation state
    this.animationState.isSliced = false;
    this.animationState.isSlicing = false;
    this.animationState.isReassembling = false;
    this.animationState.animationProgress = 0;
    
    console.log('👋 HeartAnimationController destroyed');
  }

  // Pause animations to conserve resources when not visible
  pauseAnimations(): void {
    if (window.gsap) {
      console.log('⏸️ Pausing all heart animations to conserve resources');
      window.gsap.globalTimeline.pause();
    }
    
    // Reset any in-progress animation states if needed
    if (this.animationState.isSlicing) {
      this.animationState.isSlicing = false;
    }
    
    if (this.animationState.isReassembling) {
      this.animationState.isReassembling = false;
    }
  }
  
  // Resume animations when visible again
  resumeAnimations(): void {
    if (window.gsap) {
      console.log('▶️ Resuming heart animations');
      window.gsap.globalTimeline.resume();
    }
  }
  
  // Cleanup resources and memory when not needed
  cleanupResources(): void {
    console.log('🧹 Cleaning up animation resources');
    
    // Clear any active animations
    if (window.gsap) {
      window.gsap.killTweensOf(Array.from(this.heartParts.values()));
    }
    
    // Clear label elements if any
    this.hideAnatomicalLabels();
    
    // Keep references but free memory where possible
    this.animationState.activeLabels = [];
  }

  // Optimize rendering based on device capabilities
  optimizeForDevice(): void {
    // Check if running on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      console.log('📱 Optimizing heart animation for mobile device');
      
      // Reduce animation complexity on mobile devices
      this.config.animationDuration = Math.max(1000, this.config.animationDuration * 0.8); // Slightly faster animations
      
      // Lower separation distance slightly for mobile displays
      this.config.separationDistance = this.config.separationDistance * 0.9;
      
      // Simplify parts if we have too many
      if (this.heartParts.size > 6) {
        console.log('⚡ Simplifying heart parts for better mobile performance');
        // Keep only the main parts for mobile
        const keysToKeep = ['left_ventricle', 'right_ventricle', 'left_atrium', 'right_atrium', 'aorta', 'pulmonary_artery'];
        
        // Remove non-essential parts
        Array.from(this.heartParts.keys()).forEach(key => {
          if (!keysToKeep.includes(key) && !key.startsWith('virtual_part_')) {
            this.heartParts.delete(key);
            this.originalPositions.delete(key);
          }
        });
      }
    }
  }

  // Optimize rendering based on hardware capabilities
  optimizeRendering(renderer: THREE.WebGLRenderer): void {
    console.log('⚡ Optimizing heart animation rendering');
    
    // Check if this is a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Apply optimizations based on device type
    if (isMobile) {
      console.log('📱 Applying mobile-specific rendering optimizations');
      
      // Lower pixel ratio for better performance on mobile
      const pixelRatio = Math.min(1.5, window.devicePixelRatio);
      renderer.setPixelRatio(pixelRatio);
      
      // Use simpler shadows on mobile
      renderer.shadowMap.type = THREE.BasicShadowMap;
    } else {
      // Use better shadows on desktop
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    // General optimizations for all devices
    renderer.shadowMap.enabled = true;
    
    // Log renderer info
    console.log('📊 Renderer info:', {
      pixelRatio: renderer.getPixelRatio(),
      shadowMapType: renderer.shadowMap.type,
      maxTextures: (renderer.capabilities as any).maxTextures,
      precision: (renderer.capabilities as any).precision
    });
    
    // Capture performance baseline
    this.capturePerformanceData('rendering_optimized');
  }

  // Handle device orientation changes for mobile
  handleOrientationChange(): void {
    console.log('📱 Handling device orientation change');
    
    // Check if we're in sliced mode
    if (this.animationState.isSliced) {
      // Re-layout heart parts based on new orientation
      const isLandscape = window.innerWidth > window.innerHeight;
      console.log(`Device orientation: ${isLandscape ? 'Landscape' : 'Portrait'}`);
      
      // Adjust separation based on orientation
      const separationMultiplier = isLandscape ? 1.2 : 0.8; // More separation in landscape
      
      // Re-position heart parts with adjusted separation
      this.heartParts.forEach((partObject, partId) => {
        const heartPart = heartParts.find(p => p.id === partId);
        if (!heartPart) return;
        
        const originalPos = this.originalPositions.get(partId);
        if (!originalPos) return;
        
        const targetPos = heartPart.separatedPosition.clone();
        
        // Adjust target position based on orientation
        targetPos.multiplyScalar(separationMultiplier);
        
        // Apply new position immediately if in sliced state
        if (window.gsap) {
          window.gsap.to(partObject.position, {
            duration: 0.5, // Quick transition
            x: originalPos.x + targetPos.x,
            y: originalPos.y + targetPos.y,
            z: originalPos.z + targetPos.z,
            ease: "power1.out"
          });
        } else {
          // Immediate position update without animation
          partObject.position.set(
            originalPos.x + targetPos.x,
            originalPos.y + targetPos.y,
            originalPos.z + targetPos.z
          );
        }
      });
    }
  }

  // Debug method to validate model structure and heart part mapping
  debugHeartModel(): void {
    console.log('🔍 DEBUG: Heart model structure analysis');
    
    if (!this.heartModel) {
      console.error('❌ No heart model is loaded!');
      return;
    }
    
    console.log('📊 Model hierarchy:');
    let meshCount = 0;
    this.heartModel.traverse((object) => {
      if ((object as any).isMesh) {
        meshCount++;
        console.log(`Mesh ${meshCount}: "${object.name}" - Position: ${object.position.x.toFixed(2)}, ${object.position.y.toFixed(2)}, ${object.position.z.toFixed(2)}`);
      } else if (object !== this.heartModel) {
        console.log(`Group/Other: "${object.name}"`);
      }
    });
    
    console.log(`📋 Found ${meshCount} meshes in the heart model`);
    console.log(`📋 Mapped ${this.heartParts.size} heart parts`);
    
    // Compare with expected parts
    const expectedParts = heartParts.map(p => p.id);
    const mappedParts = Array.from(this.heartParts.keys());
    
    console.log('🔍 Expected parts:', expectedParts);
    console.log('🔍 Actually mapped parts:', mappedParts);
    
    // Show parts that couldn't be mapped
    const unmappedParts = expectedParts.filter(id => !mappedParts.includes(id));
    if (unmappedParts.length > 0) {
      console.warn('⚠️ Some heart parts could not be mapped:', unmappedParts);
    }
    
    // Analyze mesh names to help with mapping
    console.log('🔍 Mesh name patterns found:');
    const meshNames: string[] = [];
    this.heartModel.traverse((object) => {
      if ((object as any).isMesh && object.name) {
        meshNames.push(object.name.toLowerCase());
      }
    });
    
    // Look for common heart part keywords
    const heartKeywords = ['atrium', 'ventricle', 'aorta', 'valve', 'chamber', 'artery', 'vein'];
    heartKeywords.forEach(keyword => {
      const matchingMeshes = meshNames.filter(name => name.includes(keyword));
      if (matchingMeshes.length > 0) {
        console.log(`Found ${matchingMeshes.length} meshes matching "${keyword}":`, matchingMeshes);
      }
    });
  }

  // Log performance data during animations
  private capturePerformanceData(operation: string): void {
    // Check if performance monitoring is available
    if (!window.performance || !window.performance.now) return;
    
    // Capture basic timing information
    const timestamp = window.performance.now();
    const memory = (window.performance as any).memory ? 
      (window.performance as any).memory.usedJSHeapSize / (1024 * 1024) : // MB
      undefined;
    
    // Assemble performance data point
    const dataPoint = {
      operation,
      timestamp,
      memory,
      animationState: { ...this.animationState },
      partsCount: this.heartParts.size,
      devicePixelRatio: window.devicePixelRatio,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      isSliced: this.animationState.isSliced
    };
    
    // Log performance data
    console.log('📊 Performance data:', dataPoint);
    
    // Could send to analytics service in production
  }
}
