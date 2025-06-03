// Performance Monitor for AR Heart Visualization System
// Tracks FPS, memory usage, and device capabilities for optimization

import type { 
  PerformanceMetrics, 
  PerformanceUpdateCallback 
} from '../types/HeartTypes';

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private callbacks: PerformanceUpdateCallback[] = [];
  private isMonitoring: boolean = false;
  private monitoringInterval: number | null = null;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private frameTimes: number[] = [];
  private maxFrameTimeSamples: number = 60; // Keep last 60 frame times
  private updateInterval: number = 1000; // Update metrics every second

  constructor() {
    this.metrics = this.initializeMetrics();
  }

  /**
   * Initialize performance metrics with default values
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      fps: 60,
      frameTime: 16.67, // Target 60fps = ~16.67ms per frame
      memoryUsage: 0,
      renderCalls: 0,
      triangleCount: 0,
      deviceType: this.detectDeviceType(),
      webglSupported: this.checkWebGLSupport(),
      isLowEndDevice: false
    };
  }

  /**
   * Detect device type based on user agent and screen size
   */
  private detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const maxDimension = Math.max(screenWidth, screenHeight);
    const minDimension = Math.min(screenWidth, screenHeight);

    // Check for mobile devices
    if (/android|iphone|ipod|blackberry|iemobile|opera mini/.test(userAgent)) {
      // Distinguish between phone and tablet
      return maxDimension > 1024 ? 'tablet' : 'mobile';
    }

    // Check for iPad specifically
    if (/ipad/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      return 'tablet';
    }

    // Check screen size for tablet detection
    if ((minDimension >= 768 && maxDimension <= 1366) && 'ontouchstart' in window) {
      return 'tablet';
    }

    return 'desktop';
  }

  /**
   * Check if WebGL is supported
   */
  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (error) {
      return false;
    }
  }

  /**
   * Detect if device is low-end based on hardware capabilities
   */
  private detectLowEndDevice(): boolean {
    // Check hardware concurrency (CPU cores)
    const cores = (navigator as any).hardwareConcurrency || 2;
    
    // Check device memory (if available)
    const memory = (navigator as any).deviceMemory || 4;
    
    // Check WebGL capabilities
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    let hasLowGPU = false;
    if (gl) {      const renderer = (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).RENDERER);
      const vendor = (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).VENDOR);
      
      // Check for known low-end GPU patterns
      const lowEndPatterns = [
        /mali-[2-4]/i,
        /adreno.*[2-3]/i,
        /powervr.*54/i,
        /intel.*hd.*[2-4]/i
      ];
      
      hasLowGPU = lowEndPatterns.some(pattern => 
        pattern.test(renderer) || pattern.test(vendor)
      );
    }

    // Consider device low-end if:
    // - Less than 3 CPU cores
    // - Less than 2GB RAM (if detectable)
    // - Low-end GPU detected
    // - No WebGL support
    return cores < 3 || memory < 2 || hasLowGPU || !gl;
  }

  /**
   * Start performance monitoring
   */
  public startMonitoring(): void {
    if (this.isMonitoring) {
      return;
    }

    console.log('PerformanceMonitor: Starting monitoring');
    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    
    // Update low-end device detection
    this.metrics.isLowEndDevice = this.detectLowEndDevice();
    
    // Start frame counting
    this.startFrameMonitoring();
    
    // Start periodic metrics update
    this.monitoringInterval = window.setInterval(() => {
      this.updateMetrics();
    }, this.updateInterval);
  }

  /**
   * Stop performance monitoring
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    console.log('PerformanceMonitor: Stopping monitoring');
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Start monitoring frame rate
   */
  private startFrameMonitoring(): void {
    const measureFrame = () => {
      if (!this.isMonitoring) return;

      const currentTime = performance.now();
      const frameTime = currentTime - this.lastFrameTime;
      
      this.frameCount++;
      this.frameTimes.push(frameTime);
      
      // Keep only the last N frame times
      if (this.frameTimes.length > this.maxFrameTimeSamples) {
        this.frameTimes.shift();
      }
      
      this.lastFrameTime = currentTime;
      
      // Request next frame
      requestAnimationFrame(measureFrame);
    };
    
    requestAnimationFrame(measureFrame);
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(): void {
    if (this.frameTimes.length === 0) return;

    // Calculate FPS from frame times
    const avgFrameTime = this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;
    const fps = Math.round(1000 / avgFrameTime);
    
    // Update metrics
    this.metrics.fps = Math.max(1, Math.min(120, fps)); // Clamp between 1-120 FPS
    this.metrics.frameTime = Number(avgFrameTime.toFixed(2));
    
    // Update memory usage (if available)
    this.updateMemoryUsage();
    
    // Update render information (if available)
    this.updateRenderInfo();
    
    // Notify callbacks
    this.notifyCallbacks();
    
    // Check for performance warnings
    this.checkPerformanceWarnings();
  }

  /**
   * Update memory usage information
   */
  private updateMemoryUsage(): void {
    try {
      // Try to get memory information from performance.memory (Chrome)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        // Convert from bytes to MB
        this.metrics.memoryUsage = Math.round(memory.usedJSHeapSize / (1024 * 1024));
      }
      // Fallback estimation based on device type
      else {
        switch (this.metrics.deviceType) {
          case 'mobile':
            this.metrics.memoryUsage = 64; // Estimate 64MB for mobile
            break;
          case 'tablet':
            this.metrics.memoryUsage = 128; // Estimate 128MB for tablet
            break;
          default:
            this.metrics.memoryUsage = 256; // Estimate 256MB for desktop
        }
      }
    } catch (error) {
      console.warn('Could not retrieve memory usage:', error);
    }
  }

  /**
   * Update render information (render calls, triangle count)
   */
  private updateRenderInfo(): void {
    try {
      // These would typically come from WebGL context or Three.js renderer
      // For now, provide estimates based on scene complexity
      
      // Estimate render calls based on device type and performance
      if (this.metrics.fps > 45) {
        this.metrics.renderCalls = 50; // High performance
      } else if (this.metrics.fps > 30) {
        this.metrics.renderCalls = 35; // Medium performance
      } else {
        this.metrics.renderCalls = 20; // Low performance
      }
      
      // Estimate triangle count for heart model
      switch (this.metrics.deviceType) {
        case 'mobile':
          this.metrics.triangleCount = 5000; // Simplified model
          break;
        case 'tablet':
          this.metrics.triangleCount = 10000; // Medium detail
          break;
        default:
          this.metrics.triangleCount = 20000; // High detail
      }
      
    } catch (error) {
      console.warn('Could not retrieve render information:', error);
    }
  }

  /**
   * Check for performance issues and emit warnings
   */
  private checkPerformanceWarnings(): void {
    const thresholds = {
      lowFPS: 24,
      highFrameTime: 42, // ~24fps
      highMemoryUsage: this.metrics.deviceType === 'mobile' ? 128 : 256
    };

    let hasWarning = false;
    const warnings: string[] = [];

    if (this.metrics.fps < thresholds.lowFPS) {
      warnings.push(`Low FPS detected: ${this.metrics.fps}`);
      hasWarning = true;
    }

    if (this.metrics.frameTime > thresholds.highFrameTime) {
      warnings.push(`High frame time: ${this.metrics.frameTime}ms`);
      hasWarning = true;
    }

    if (this.metrics.memoryUsage > thresholds.highMemoryUsage) {
      warnings.push(`High memory usage: ${this.metrics.memoryUsage}MB`);
      hasWarning = true;
    }

    if (hasWarning) {
      console.warn('Performance warnings:', warnings);
      
      // Emit performance warning event
      this.callbacks.forEach(callback => {
        try {
          callback({ ...this.metrics });
        } catch (error) {
          console.error('Error calling performance callback:', error);
        }
      });
    }
  }

  /**
   * Notify all callbacks with current metrics
   */
  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => {
      try {
        callback({ ...this.metrics });
      } catch (error) {
        console.error('Error calling performance callback:', error);
      }
    });
  }

  /**
   * Add performance update callback
   */
  public addCallback(callback: PerformanceUpdateCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * Remove performance update callback
   */
  public removeCallback(callback: PerformanceUpdateCallback): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): Readonly<PerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * Get performance recommendation based on current metrics
   */
  public getPerformanceRecommendation(): {
    mode: 'high' | 'medium' | 'low';
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    let mode: 'high' | 'medium' | 'low' = 'high';

    // Analyze performance metrics
    if (this.metrics.fps < 24 || this.metrics.isLowEndDevice) {
      mode = 'low';
      suggestions.push('Reduce animation complexity');
      suggestions.push('Lower model detail');
      suggestions.push('Limit concurrent animations');
    } else if (this.metrics.fps < 45 || this.metrics.deviceType === 'mobile') {
      mode = 'medium';
      suggestions.push('Use simplified animations');
      suggestions.push('Reduce particle effects');
    }

    if (this.metrics.memoryUsage > 200) {
      suggestions.push('Optimize memory usage');
      suggestions.push('Reduce texture sizes');
    }

    if (!this.metrics.webglSupported) {
      mode = 'low';
      suggestions.push('WebGL not supported - use fallback rendering');
    }

    return { mode, suggestions };
  }

  /**
   * Reset performance metrics
   */
  public reset(): void {
    this.frameCount = 0;
    this.frameTimes = [];
    this.lastFrameTime = performance.now();
    this.metrics = this.initializeMetrics();
  }

  /**
   * Get debug information for development
   */
  public getDebugInfo(): {
    isMonitoring: boolean;
    frameCount: number;
    sampleCount: number;
    updateInterval: number;
    deviceCapabilities: object;
  } {
    return {
      isMonitoring: this.isMonitoring,
      frameCount: this.frameCount,
      sampleCount: this.frameTimes.length,
      updateInterval: this.updateInterval,
      deviceCapabilities: {
        hardwareConcurrency: (navigator as any).hardwareConcurrency,
        deviceMemory: (navigator as any).deviceMemory,
        webglSupported: this.metrics.webglSupported,
        deviceType: this.metrics.deviceType,
        isLowEndDevice: this.metrics.isLowEndDevice
      }
    };
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    this.stopMonitoring();
    this.callbacks = [];
    this.frameTimes = [];
  }
}

export default PerformanceMonitor;