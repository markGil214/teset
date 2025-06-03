// Performance monitoring utility for AR heart visualization
import * as THREE from 'three';

export class PerformanceMonitor {
  private frames: number = 0;
  private prevTime: number = 0;
  private fps: number = 0;
  private fpsHistory: number[] = [];
  private memoryUsage: any[] = [];
  private isMonitoring: boolean = false;
  private monitorElement: HTMLElement | null = null;
  private renderInfo: any = null;
  private renderer: THREE.WebGLRenderer | null = null;
  
  constructor(renderer?: THREE.WebGLRenderer) {
    this.renderer = renderer || null;
    this.prevTime = performance.now();
  }
  
  // Start monitoring performance
  startMonitoring(showUI: boolean = false): void {
    this.isMonitoring = true;
    this.frames = 0;
    this.prevTime = performance.now();
    this.fpsHistory = [];
    this.memoryUsage = [];
    
    if (showUI && !this.monitorElement) {
      this.createMonitorUI();
    }
    
    // Start the update loop
    this.update();
  }
  
  // Stop monitoring
  stopMonitoring(): void {
    this.isMonitoring = false;
    
    if (this.monitorElement && this.monitorElement.parentNode) {
      this.monitorElement.parentNode.removeChild(this.monitorElement);
      this.monitorElement = null;
    }
  }
  
  // Main update loop
  private update = (): void => {
    if (!this.isMonitoring) return;
    
    this.frames++;
    const time = performance.now();
    
    // Calculate FPS every second
    if (time >= this.prevTime + 1000) {
      this.fps = Math.round((this.frames * 1000) / (time - this.prevTime));
      this.fpsHistory.push(this.fps);
      
      // Keep only the last 60 measurements
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }
      
      // Track memory if available
      if ((performance as any).memory) {
        this.memoryUsage.push({
          time: Date.now(),
          used: (performance as any).memory.usedJSHeapSize / (1024 * 1024), // MB
          total: (performance as any).memory.totalJSHeapSize / (1024 * 1024) // MB
        });
        
        // Keep last 30 measurements
        if (this.memoryUsage.length > 30) {
          this.memoryUsage.shift();
        }
      }
      
      // Collect renderer stats if available
      if (this.renderer) {
        this.renderInfo = this.renderer.info;
      }
      
      // Update UI if visible
      if (this.monitorElement) {
        this.updateMonitorUI();
      }
      
      // Log performance every 5 seconds if below threshold
      if (this.fpsHistory.length % 5 === 0 && this.getAverageFPS() < 30) {
        console.warn(`⚠️ Low performance detected: ${this.getAverageFPS().toFixed(1)} FPS`);
      }
      
      // Reset for next measurement
      this.frames = 0;
      this.prevTime = time;
    }
    
    // Continue monitoring
    requestAnimationFrame(this.update);
  }
  
  // Get current FPS
  getFPS(): number {
    return this.fps;
  }
  
  // Get average FPS over last measurements
  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return sum / this.fpsHistory.length;
  }
  
  // Get performance summary
  getPerformanceSummary(): any {
    return {
      currentFPS: this.fps,
      averageFPS: this.getAverageFPS(),
      fpsHistory: [...this.fpsHistory],
      memoryUsage: [...this.memoryUsage],
      renderInfo: this.renderInfo ? { ...this.renderInfo } : null
    };
  }
  
  // Create UI element for performance monitoring
  private createMonitorUI(): void {
    this.monitorElement = document.createElement('div');
    Object.assign(this.monitorElement.style, {
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '8px',
      borderRadius: '4px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: '9999',
      pointerEvents: 'none'
    });
    
    document.body.appendChild(this.monitorElement);
  }
  
  // Update the monitor UI with current stats
  private updateMonitorUI(): void {
    if (!this.monitorElement) return;
    
    let html = `FPS: ${this.fps} (avg: ${this.getAverageFPS().toFixed(1)})`;
    
    if ((performance as any).memory) {
      const memory = this.memoryUsage[this.memoryUsage.length - 1];
      html += `<br>Memory: ${memory.used.toFixed(1)}MB / ${memory.total.toFixed(1)}MB`;
    }
    
    if (this.renderInfo) {
      html += `<br>Render calls: ${this.renderInfo.render.calls}`;
      html += `<br>Triangles: ${this.renderInfo.render.triangles}`;
    }
    
    this.monitorElement.innerHTML = html;
  }
  
  // Set renderer for additional stats
  setRenderer(renderer: THREE.WebGLRenderer): void {
    this.renderer = renderer;
  }
}
