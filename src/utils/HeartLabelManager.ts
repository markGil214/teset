// HeartLabelManager.ts - Manages anatomical labels for the heart model
import { AnatomicalPoint } from "../assets/data/anatomicalData";

declare global {
  interface Window {
    THREE: any;
  }
}

export class HeartLabelManager {
  private labelPositions: { [key: string]: { x: number; y: number } } = {};
  private isVisible: boolean = false;

  /**
   * Convert 3D world positions to 2D screen positions for labels
   */
  public updateLabelPositions(
    markerGroup: any,
    camera: any,
    renderer: any,
    anatomicalPoints: AnatomicalPoint[]
  ): { [key: string]: { x: number; y: number } } {
    if (!markerGroup || !markerGroup.organModel || !this.isVisible) {
      return {};
    }

    const newPositions: { [key: string]: { x: number; y: number } } = {};

    anatomicalPoints.forEach((point) => {
      try {
        // Create a 3D vector at the anatomical point position
        const vector = new window.THREE.Vector3(
          point.position.x,
          point.position.y,
          point.position.z
        );

        // Apply the marker group's transform to get world position
        vector.applyMatrix4(markerGroup.matrixWorld);

        // Project to screen coordinates
        vector.project(camera);

        // Convert to screen pixels
        const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
        const y = (vector.y * -0.5 + 0.5) * renderer.domElement.clientHeight;

        // Only include positions that are in front of the camera
        if (vector.z < 1) {
          newPositions[point.id] = { x, y };
        }
      } catch (error) {
        console.warn(`Error calculating position for label ${point.id}:`, error);
      }
    });

    this.labelPositions = newPositions;
    return newPositions;
  }

  /**
   * Show or hide labels
   */
  public setLabelsVisible(visible: boolean): void {
    this.isVisible = visible;
  }

  /**
   * Get current visibility state
   */
  public getLabelsVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Get current label positions
   */
  public getLabelPositions(): { [key: string]: { x: number; y: number } } {
    return this.labelPositions;
  }

  /**
   * Check if a specific label is visible on screen
   */
  public isLabelVisible(labelId: string): boolean {
    const position = this.labelPositions[labelId];
    if (!position) return false;
    
    return (
      position.x > 0 &&
      position.x < window.innerWidth &&
      position.y > 0 &&
      position.y < window.innerHeight
    );
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.labelPositions = {};
    this.isVisible = false;
  }
}