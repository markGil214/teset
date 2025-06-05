// Heart parts data structure inspired by sample/App.tsx
// Adapted for AR environment using traditional Three.js

export interface HeartPart {
  id: string;
  name: string;
  description: string;
  position: [number, number, number]; // 3D position relative to heart model
  color: string;
  detailedInfo?: string;
}

export const heartParts: HeartPart[] = [
  {
    id: "1",
    name: "Aorta",
    description: "The main artery that carries oxygenated blood from the left ventricle to the rest of the body.",
    position: [0, 0.4, 0.2],
    color: "#e74c3c",
    detailedInfo: "The aorta is the largest artery in the human body, originating from the left ventricle of the heart and extending down to the abdomen."
  },
  {
    id: "2", 
    name: "Superior Vena Cava",
    description: "Large vein that carries deoxygenated blood from the upper body back to the right atrium of the heart.",
    position: [-0.2, 0.3, 0.1],
    color: "#3498db",
    detailedInfo: "The superior vena cava collects blood from the head, neck, arms, and upper chest and returns it to the heart."
  },
  {
    id: "3",
    name: "Pulmonary Artery", 
    description: "Carries deoxygenated blood from the right ventricle to the lungs for oxygenation.",
    position: [0.3, 0.2, 0.1],
    color: "#9b59b6",
    detailedInfo: "The pulmonary artery is unique as it's the only artery that carries deoxygenated blood, transporting it to the lungs for gas exchange."
  },
  {
    id: "4",
    name: "Right Atrium",
    description: "Upper right chamber of the heart that receives deoxygenated blood from the body via the vena cavae.", 
    position: [0.1, 0.1, 0.2],
    color: "#2ecc71",
    detailedInfo: "The right atrium receives blood from the superior and inferior vena cavae and pumps it to the right ventricle during atrial contraction."
  },
  {
    id: "5",
    name: "Left Atrium",
    description: "Upper left chamber of the heart that receives oxygenated blood from the lungs via the pulmonary veins.",
    position: [-0.1, 0.1, 0.2], 
    color: "#f39c12",
    detailedInfo: "The left atrium receives oxygen-rich blood from the pulmonary veins and pumps it to the left ventricle, which then distributes it throughout the body."
  },
  {
    id: "6", 
    name: "Right Ventricle",
    description: "Lower right chamber of the heart that pumps deoxygenated blood to the lungs through the pulmonary artery.",
    position: [0.1, -0.2, 0.2],
    color: "#8e44ad",
    detailedInfo: "The right ventricle has thinner walls than the left ventricle as it only needs to pump blood to the nearby lungs."
  },
  {
    id: "7",
    name: "Left Ventricle", 
    description: "Lower left chamber of the heart that pumps oxygenated blood to the body through the aorta. It has the thickest muscular wall.",
    position: [-0.1, -0.2, 0.2],
    color: "#c0392b",
    detailedInfo: "The left ventricle is the heart's strongest chamber, with thick muscular walls that generate the pressure needed to pump blood throughout the entire body."
  },
  {
    id: "8",
    name: "Inferior Vena Cava",
    description: "Large vein that carries deoxygenated blood from the lower body back to the right atrium of the heart.",
    position: [0.1, -0.4, 0.1], 
    color: "#34495e",
    detailedInfo: "The inferior vena cava is the largest vein in the human body, collecting blood from the lower limbs, pelvis, and abdomen."
  }
];

// Label positioning settings for AR environment
export const labelSettings = {
  offset: [0.3, 0, 0] as [number, number, number], // Offset from anatomical point
  scale: {
    min: 0.8,
    max: 1.2
  },
  visibilityZoom: {
    show: 2.0, // Zoom level when labels become visible
    hide: 1.5  // Zoom level when labels hide
  }
};
