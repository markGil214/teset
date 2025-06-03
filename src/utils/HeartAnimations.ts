import { Object3D, Vector3 } from 'three';

// Define heart chamber part interfaces
export interface HeartChamber {
  id: string;
  name: string;
  description: string;
  object3D: Object3D | null;
  originalPosition: Vector3 | null;
  explodedPosition: Vector3 | null;
}

// Default heart chambers configuration
export const heartChambers: HeartChamber[] = [
  {
    id: 'leftAtrium',
    name: 'Left Atrium',
    description: 'Receives oxygenated blood from the lungs via the pulmonary veins',
    object3D: null,
    originalPosition: null,
    explodedPosition: new Vector3(-0.3, 0.2, 0),
  },
  {
    id: 'rightAtrium',
    name: 'Right Atrium',
    description: 'Receives deoxygenated blood from the body via the superior and inferior vena cava',
    object3D: null,
    originalPosition: null,
    explodedPosition: new Vector3(0.3, 0.2, 0),
  },
  {
    id: 'leftVentricle',
    name: 'Left Ventricle',
    description: 'Pumps oxygenated blood to the body through the aorta',
    object3D: null,
    originalPosition: null,
    explodedPosition: new Vector3(-0.3, -0.2, 0),
  },
  {
    id: 'rightVentricle',
    name: 'Right Ventricle',
    description: 'Pumps deoxygenated blood to the lungs through the pulmonary artery',
    object3D: null,
    originalPosition: null,
    explodedPosition: new Vector3(0.3, -0.2, 0),
  },
];

// Identify heart parts from the loaded model
export function identifyHeartParts(heartModel: Object3D): HeartChamber[] {
  console.log('Identifying heart parts...');
  
  // First, let's try to find chambers by names in the model
  const chambers = [...heartChambers];
  
  // For debugging, log all parts in the model
  heartModel.traverse((child) => {
    if (child.name) {
      console.log(`Found model part: ${child.name}`);
    }
  });

  // Try to find chambers by typical part names (might vary based on your model)
  const nameMappings: { [key: string]: string } = {
    // Map model part names to our chamber IDs
    // Examples - adjust based on your actual model:
    'Left_Atrium': 'leftAtrium',
    'Right_Atrium': 'rightAtrium',
    'Left_Ventricle': 'leftVentricle',
    'Right_Ventricle': 'rightVentricle',
    // Add more variations as you discover them in your model:
    'L_Atrium': 'leftAtrium',
    'R_Atrium': 'rightAtrium',
    'L_Ventricle': 'leftVentricle',
    'R_Ventricle': 'rightVentricle',
    // Common 3D model naming patterns:
    'leftAtrium': 'leftAtrium',
    'rightAtrium': 'rightAtrium',
    'leftVentricle': 'leftVentricle',
    'rightVentricle': 'rightVentricle',
  };

  // Look for chamber matches
  heartModel.traverse((child: Object3D) => {
    // Skip the root object
    if (child === heartModel) return;
    
    if (child.name && nameMappings[child.name]) {
      const chamberId = nameMappings[child.name];
      const chamber = chambers.find(c => c.id === chamberId);
      
      if (chamber) {
        chamber.object3D = child;
        chamber.originalPosition = child.position.clone();
        console.log(`Identified ${chamber.name} as ${child.name}`);
      }
    }
  });

  // If we couldn't find proper named parts, use mesh objects as fallback
  const chamberCount = chambers.filter(c => c.object3D !== null).length;
  
  if (chamberCount === 0) {
    console.log('No named chambers found, creating synthetic chambers from mesh objects');
    
    // Find all mesh objects that could be heart parts
    const meshes: Object3D[] = [];
    heartModel.traverse((child: any) => {
      if (child.isMesh && child !== heartModel) {
        meshes.push(child);
      }
    });
    
    // Sort meshes by size/volume as a heuristic for identifying main chambers
    // This is a fallback when model doesn't have proper naming
    if (meshes.length >= 4) {
      for (let i = 0; i < Math.min(4, meshes.length); i++) {
        chambers[i].object3D = meshes[i];
        chambers[i].originalPosition = meshes[i].position.clone();
        console.log(`Assigned mesh as ${chambers[i].name} (fallback method)`);
      }
    }
  }
  
  return chambers;
}

// Start heart slicing animation - separate chambers
export function startHeartSlicing(chambers: HeartChamber[]): void {
  console.log('Starting heart slicing animation...');
  
  chambers.forEach((chamber) => {
    if (chamber.object3D && chamber.explodedPosition) {
      // Animate using GSAP if available, otherwise use direct position
      if (window.gsap) {
        window.gsap.to(chamber.object3D.position, {
          duration: 1.5,
          x: chamber.explodedPosition.x,
          y: chamber.explodedPosition.y,
          z: chamber.explodedPosition.z,
          ease: 'power2.out',
        });
      } else {
        // Direct movement without animation
        chamber.object3D.position.copy(chamber.explodedPosition);
      }
      
      console.log(`Moved ${chamber.name} to exploded position`);
    }
  });
}

// Reset heart to normal view - rejoin chambers
export function resetHeartSlicing(chambers: HeartChamber[]): void {
  console.log('Resetting heart to normal view...');
  
  chambers.forEach((chamber) => {
    if (chamber.object3D && chamber.originalPosition) {
      // Animate using GSAP if available, otherwise use direct position
      if (window.gsap) {
        window.gsap.to(chamber.object3D.position, {
          duration: 1.5,
          x: chamber.originalPosition.x,
          y: chamber.originalPosition.y,
          z: chamber.originalPosition.z,
          ease: 'power2.out',
        });
      } else {
        // Direct movement without animation
        chamber.object3D.position.copy(chamber.originalPosition);
      }
      
      console.log(`Moved ${chamber.name} back to original position`);
    }
  });
}

// Update TypeScript global declarations to include GSAP
declare global {
  interface Window {
    gsap: any;
  }
}
