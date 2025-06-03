// Heart label creator for AR visualization
import * as THREE from 'three';
import { HeartLabel, HeartPart } from '../types/HeartTypes';

export class HeartLabelManager {
  private labels: HeartLabel[] = [];
  private container: HTMLElement | null = null;
  private camera: THREE.Camera | null = null;
  private scene: THREE.Scene | null = null;
  private isVisible: boolean = false;
  private heartParts: HeartPart[] = [];
  
  constructor(heartParts: HeartPart[]) {
    this.heartParts = heartParts;
  }
  
  // Initialize with DOM container and 3D references
  initialize(container: HTMLElement, camera: THREE.Camera, scene: THREE.Scene): void {
    this.container = container;
    this.camera = camera;
    this.scene = scene;
    this.createLabels();
  }
    // Create HTML labels for heart parts
  private createLabels(): void {
    if (!this.container) return;
    
    // Remove any existing labels
    this.clear();
    
    // Create a label for each heart part
    this.heartParts.forEach(part => {
      if (!part.visible) return;
      
      // Create the label HTML element
      const label = document.createElement('div');
      label.className = 'heart-label';
      label.id = `heart-label-${part.id}`;
      
      // Style the label
      Object.assign(label.style, {
        position: 'absolute',
        padding: '8px',
        backgroundColor: part.color || 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 'bold',
        pointerEvents: 'none',
        display: 'none',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
        maxWidth: '150px',
        zIndex: '1000',
        opacity: '0',
        transition: 'opacity 0.3s ease'
      });
      
      // Set the content
      label.innerHTML = `
        <div style="font-weight: bold;">${part.displayName}</div>
        <div style="font-size: 12px; margin-top: 4px;">${part.function}</div>
      `;
      
      // Add to container (container is checked at the beginning of the method)
      this.container!.appendChild(label);
      
      // Create the label data structure
      const labelData: HeartLabel = {
        id: part.id,
        heartPartId: part.id,
        text: part.displayName,
        position: part.position.clone().add(part.separatedPosition), // Position in sliced state
        arrowTarget: part.position.clone().add(part.separatedPosition).multiplyScalar(0.8),
        visible: false,
        htmlElement: label
      };
      
      this.labels.push(labelData);
    });
    
    console.log(`Created ${this.labels.length} heart labels`);
  }
    // Update label positions based on camera view
  update(): void {
    if (!this.isVisible || !this.camera || !this.scene || !this.container) return;
    
    const width = this.container.offsetWidth;
    const height = this.container.offsetHeight;
    
    this.labels.forEach(label => {
      if (!label.visible || !label.htmlElement) return;
      
      // Project 3D position to 2D screen space
      const position = label.position.clone();
      // Camera is checked at the beginning of the method, so it's safe to use non-null assertion
      const vector = position.project(this.camera!);
      
      // Convert to screen coordinates
      const x = (vector.x * 0.5 + 0.5) * width;
      const y = (-vector.y * 0.5 + 0.5) * height;
      
      // Check if label is in front of the camera
      if (vector.z > 1) {
        label.htmlElement.style.display = 'none';
        return;
      }
      
      // Update label position
      label.htmlElement.style.display = 'block';
      label.htmlElement.style.left = `${x}px`;
      label.htmlElement.style.top = `${y}px`;
    });
  }
  
  // Show all labels
  show(): void {
    this.isVisible = true;
    
    this.labels.forEach(label => {
      if (label.htmlElement) {
        label.htmlElement.style.display = 'block';
        label.htmlElement.style.opacity = '1';
        label.visible = true;
      }
    });
    
    console.log('Showing heart labels');
  }
  
  // Hide all labels
  hide(): void {
    this.isVisible = false;
    
    this.labels.forEach(label => {
      if (label.htmlElement) {
        label.htmlElement.style.opacity = '0';
        setTimeout(() => {
          if (label.htmlElement && !this.isVisible) {
            label.htmlElement.style.display = 'none';
          }
        }, 300); // Wait for transition to complete
        label.visible = false;
      }
    });
    
    console.log('Hiding heart labels');
  }
  
  // Clean up resources
  clear(): void {
    this.labels.forEach(label => {
      if (label.htmlElement && label.htmlElement.parentNode) {
        label.htmlElement.parentNode.removeChild(label.htmlElement);
      }
    });
    
    this.labels = [];
    this.isVisible = false;
  }
  
  // Clean up all resources
  dispose(): void {
    this.clear();
    this.container = null;
    this.camera = null;
    this.scene = null;
  }
}
