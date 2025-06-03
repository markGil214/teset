// Heart Label Manager for AR Heart Visualization System
// Manages anatomical labels that appear when heart parts are sliced

import { HeartLabel, Vector3 } from '../types/HeartTypes';
import { DEFAULT_HEART_LABELS } from '../assets/components/HeartData';

export class HeartLabelManager {
  private labels: HeartLabel[] = [];
  private labelElements: Map<string, HTMLElement> = new Map();
  private containerElement: HTMLElement | null = null;
  private isInitialized: boolean = false;
  private isVisible: boolean = false;

  constructor(containerSelector: string = 'body') {
    this.containerElement = document.querySelector(containerSelector);
    if (!this.containerElement) {
      console.error('HeartLabelManager: Container element not found');
      return;
    }
    
    this.initialize();
  }

  /**
   * Initialize the label manager
   */
  private initialize(): void {
    try {
      console.log('HeartLabelManager: Initializing...');
      
      // Load default labels
      this.labels = [...DEFAULT_HEART_LABELS];
      
      // Create label container
      this.createLabelContainer();
      
      // Create label elements
      this.createLabelElements();
      
      this.isInitialized = true;
      console.log('HeartLabelManager: Initialization complete');
      
    } catch (error) {
      console.error('HeartLabelManager: Initialization failed:', error);
    }
  }

  /**
   * Create the main label container
   */
  private createLabelContainer(): void {
    // Remove existing container if it exists
    const existingContainer = document.getElementById('heart-labels-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    // Create new container
    const container = document.createElement('div');
    container.id = 'heart-labels-container';
    container.className = 'heart-labels-container';
    
    // Apply base styles
    Object.assign(container.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '1000',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    });

    this.containerElement?.appendChild(container);
  }

  /**
   * Create individual label elements
   */
  private createLabelElements(): void {
    this.labels.forEach(label => {
      const labelElement = this.createLabelElement(label);
      this.labelElements.set(label.id, labelElement);
      
      const container = document.getElementById('heart-labels-container');
      container?.appendChild(labelElement);
    });
  }

  /**
   * Create a single label element
   */
  private createLabelElement(label: HeartLabel): HTMLElement {
    const labelElement = document.createElement('div');
    labelElement.id = `heart-label-${label.id}`;
    labelElement.className = 'heart-label';
    
    // Create label content
    const titleElement = document.createElement('div');
    titleElement.className = 'heart-label-title';
    titleElement.textContent = label.text;
    
    const descriptionElement = document.createElement('div');
    descriptionElement.className = 'heart-label-description';
    descriptionElement.textContent = label.anatomicalName;
    
    labelElement.appendChild(titleElement);
    labelElement.appendChild(descriptionElement);
    
    // Apply styles
    this.applyLabelStyles(labelElement, label);
    
    // Initially hidden
    labelElement.style.display = 'none';
    
    return labelElement;
  }

  /**
   * Apply styles to a label element
   */
  private applyLabelStyles(element: HTMLElement, label: HeartLabel): void {
    // Base label styles
    Object.assign(element.style, {
      position: 'absolute',
      padding: '8px 12px',
      borderRadius: '6px',
      backgroundColor: label.backgroundColor || 'rgba(0, 0, 0, 0.8)',
      color: label.color || '#ffffff',
      fontSize: `${label.fontSize || 14}px`,
      fontWeight: '500',
      lineHeight: '1.4',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(4px)',
      maxWidth: '200px',
      wordWrap: 'break-word',
      transition: 'all 0.3s ease',
      transform: 'scale(0.9)',
      opacity: '0'
    });

    // Title styles
    const titleElement = element.querySelector('.heart-label-title') as HTMLElement;
    if (titleElement) {
      Object.assign(titleElement.style, {
        fontWeight: '600',
        marginBottom: '4px',
        fontSize: `${(label.fontSize || 14) + 1}px`
      });
    }

    // Description styles
    const descriptionElement = element.querySelector('.heart-label-description') as HTMLElement;
    if (descriptionElement) {
      Object.assign(descriptionElement.style, {
        fontSize: `${(label.fontSize || 14) - 1}px`,
        opacity: '0.9',
        fontWeight: '400'
      });
    }

    // Position the label
    this.positionLabel(element, label);
  }

  /**
   * Position a label based on its 3D position
   */
  private positionLabel(element: HTMLElement, label: HeartLabel): void {
    // Convert 3D position to 2D screen coordinates
    const screenPos = this.worldToScreen(label.position);
    
    if (screenPos) {
      element.style.left = `${screenPos.x}px`;
      element.style.top = `${screenPos.y}px`;
      element.style.transform = 'translate(-50%, -100%)'; // Center horizontally, position above point
    }
  }
  /**
   * Convert world coordinates to screen coordinates
   * This is a simplified implementation - in a real AR app, you'd use the camera's projection matrix
   */
  private worldToScreen(worldPos: Vector3): { x: number; y: number } | null {
    try {
      // For now, use a simple mapping based on viewport center
      // In a real implementation, this would use the AR camera's projection
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const centerX = viewportWidth / 2;
      const centerY = viewportHeight / 2;
      
      // Simple projection (you'd replace this with proper matrix math)
      const x = centerX + (worldPos.x * 200); // Scale factor for positioning
      const y = centerY - (worldPos.y * 200); // Negative Y because screen Y is inverted
      
      return { x, y };
    } catch (error) {
      console.error('Error converting world to screen coordinates:', error);
      return null;
    }
  }

  /**
   * Show labels for specific heart parts
   */
  public showLabelsForParts(partIds: string[]): void {
    if (!this.isInitialized) return;
    
    console.log('Showing labels for parts:', partIds);
    
    this.labels.forEach(label => {
      if (partIds.includes(label.targetPartId)) {
        this.showLabel(label.id);
      }
    });
    
    this.isVisible = true;
  }

  /**
   * Hide labels for specific heart parts
   */
  public hideLabelsForParts(partIds: string[]): void {
    if (!this.isInitialized) return;
    
    console.log('Hiding labels for parts:', partIds);
    
    this.labels.forEach(label => {
      if (partIds.includes(label.targetPartId)) {
        this.hideLabel(label.id);
      }
    });
  }

  /**
   * Show a specific label
   */
  public showLabel(labelId: string): void {
    const element = this.labelElements.get(labelId);
    if (!element) return;
    
    element.style.display = 'block';
    
    // Animate in
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = element.style.transform.replace('scale(0.9)', 'scale(1)');
    });
  }

  /**
   * Hide a specific label
   */
  public hideLabel(labelId: string): void {
    const element = this.labelElements.get(labelId);
    if (!element) return;
    
    // Animate out
    element.style.opacity = '0';
    element.style.transform = element.style.transform.replace('scale(1)', 'scale(0.9)');
    
    setTimeout(() => {
      element.style.display = 'none';
    }, 300);
  }

  /**
   * Show all labels
   */
  public showAllLabels(): void {
    console.log('Showing all heart labels');
    
    this.labels.forEach(label => {
      this.showLabel(label.id);
    });
    
    this.isVisible = true;
  }

  /**
   * Hide all labels
   */
  public hideAllLabels(): void {
    console.log('Hiding all heart labels');
    
    this.labels.forEach(label => {
      this.hideLabel(label.id);
    });
    
    this.isVisible = false;
  }

  /**
   * Update label positions (call when camera moves or heart rotates)
   */
  public updateLabelPositions(): void {
    if (!this.isInitialized || !this.isVisible) return;
    
    this.labels.forEach(label => {
      const element = this.labelElements.get(label.id);
      if (element && element.style.display !== 'none') {
        this.positionLabel(element, label);
      }
    });
  }

  /**
   * Add a new label
   */
  public addLabel(label: HeartLabel): void {
    // Check if label already exists
    if (this.labels.find(l => l.id === label.id)) {
      console.warn(`Label with id ${label.id} already exists`);
      return;
    }
    
    this.labels.push(label);
    
    if (this.isInitialized) {
      const labelElement = this.createLabelElement(label);
      this.labelElements.set(label.id, labelElement);
      
      const container = document.getElementById('heart-labels-container');
      container?.appendChild(labelElement);
    }
  }

  /**
   * Remove a label
   */
  public removeLabel(labelId: string): void {
    // Remove from labels array
    this.labels = this.labels.filter(label => label.id !== labelId);
    
    // Remove element
    const element = this.labelElements.get(labelId);
    if (element) {
      element.remove();
      this.labelElements.delete(labelId);
    }
  }

  /**
   * Update label content
   */
  public updateLabel(labelId: string, updates: Partial<HeartLabel>): void {
    const labelIndex = this.labels.findIndex(label => label.id === labelId);
    if (labelIndex === -1) return;
    
    // Update label data
    this.labels[labelIndex] = { ...this.labels[labelIndex], ...updates };
    
    // Update element
    const element = this.labelElements.get(labelId);
    if (element) {
      const titleElement = element.querySelector('.heart-label-title') as HTMLElement;
      const descriptionElement = element.querySelector('.heart-label-description') as HTMLElement;
      
      if (updates.text && titleElement) {
        titleElement.textContent = updates.text;
      }
      
      if (updates.anatomicalName && descriptionElement) {
        descriptionElement.textContent = updates.anatomicalName;
      }
      
      // Reapply styles if appearance properties changed
      if (updates.color || updates.backgroundColor || updates.fontSize) {
        this.applyLabelStyles(element, this.labels[labelIndex]);
      }
    }
  }

  /**
   * Get all labels
   */
  public getLabels(): Readonly<HeartLabel[]> {
    return [...this.labels];
  }

  /**
   * Get labels for specific heart parts
   */
  public getLabelsForParts(partIds: string[]): HeartLabel[] {
    return this.labels.filter(label => partIds.includes(label.targetPartId));
  }

  /**
   * Check if labels are currently visible
   */
  public isLabelsVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Handle window resize
   */
  public onWindowResize(): void {
    if (this.isVisible) {
      // Debounce the position update
      setTimeout(() => {
        this.updateLabelPositions();
      }, 100);
    }
  }

  /**
   * Set label visibility for a specific anatomical type
   */
  public setLabelVisibilityByType(anatomicalType: string, visible: boolean): void {
    console.log(`Setting labels visibility for type ${anatomicalType}: ${visible}`);
    
    // Find heart parts with this anatomical type and show/hide their labels
    // This would need to be coordinated with the HeartAnimationController
    // For now, we'll filter labels that contain the type in their ID or text
    
    this.labels.forEach(label => {
      const matchesType = label.id.includes(anatomicalType) || 
                         label.text.toLowerCase().includes(anatomicalType) ||
                         label.anatomicalName.toLowerCase().includes(anatomicalType);
      
      if (matchesType) {
        if (visible) {
          this.showLabel(label.id);
        } else {
          this.hideLabel(label.id);
        }
      }
    });
  }

  /**
   * Get label visibility statistics
   */
  public getVisibilityStats(): {
    total: number;
    visible: number;
    hidden: number;
  } {
    let visible = 0;
    let hidden = 0;
    
    this.labelElements.forEach(element => {
      if (element.style.display === 'none') {
        hidden++;
      } else {
        visible++;
      }
    });
    
    return {
      total: this.labels.length,
      visible,
      hidden
    };
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    console.log('HeartLabelManager: Disposing resources');
    
    // Remove all label elements
    this.labelElements.forEach(element => {
      element.remove();
    });
    
    // Remove container
    const container = document.getElementById('heart-labels-container');
    container?.remove();
    
    // Clear collections
    this.labels = [];
    this.labelElements.clear();
    
    this.isInitialized = false;
    this.isVisible = false;
  }
}

export default HeartLabelManager;