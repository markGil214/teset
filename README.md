# 🫀 AR Heart Visualization System

## Interactive Educational AR Application with Advanced 3D Heart Anatomy

[![React](https://img.shields.io/badge/React-18.0+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-green.svg)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-AR-orange.svg)](https://threejs.org/)
[![WebAR](https://img.shields.io/badge/WebAR-THREEAR-red.svg)](https://github.com/jeromeetienne/AR.js)

> **Capstone Project**: Advanced AR system for interactive heart anatomy visualization with zoom controls, slicing animations, anatomical labeling, and comprehensive medical information.

## 🎯 Project Overview

This educational AR application provides an immersive learning experience for heart anatomy through:

- **Interactive 3D Heart Models** with realistic textures and animations
- **Advanced Zoom System** with button and touch/pinch controls
- **Dynamic Heart Slicing** animations triggered by zoom levels
- **Anatomical Labeling** with arrows and interactive tooltips
- **Medical Information** overlays with disease data and prevention tips
- **Professional AR Interface** optimized for educational presentations

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18.0+
npm or yarn package manager
Modern web browser with WebGL support
Webcam/camera access for AR functionality
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vite-project

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### AR Setup

1. Print the **Hiro marker** from `/public/marker.html`
2. Allow camera permissions when prompted
3. Point camera at the marker to activate AR
4. Use zoom controls to explore heart anatomy

---

## 🏗️ System Architecture

### 📁 Project Structure

```
src/
├── assets/
│   ├── components/
│   │   ├── organData.ts          # Organ definitions and paths
│   │   ├── HeartData.ts          # Heart-specific medical data
│   │   ├── ARControls.tsx        # Zoom and interaction controls
│   │   ├── ARInfoPanel.tsx       # Medical information display
│   │   └── ARLabels.tsx          # Anatomical labeling system
│   ├── pages/
│   │   ├── ARScannerPage.tsx     # Main AR interface
│   │   ├── ScanExploreHub.tsx    # Organ selection hub
│   │   └── OrganDetailPage.tsx   # Individual organ details
│   └── styles/
│       └── ARInterface.css       # AR-specific styling
├── utils/
│   ├── ARHelpers.ts             # AR utility functions
│   ├── ZoomController.ts        # Zoom logic and animations
│   └── HeartAnimations.ts       # Heart slicing animations
└── types/
    ├── HeartTypes.ts            # TypeScript interfaces
    └── ARTypes.ts               # AR-specific type definitions

public/
├── heart_models/
│   ├── complete_heart.gltf      # Main heart model
│   ├── heart_chambers.gltf      # Sliced heart parts
│   └── heart_labels.json       # Label positioning data
├── medical_data/
│   ├── heart_diseases.json     # Disease information
│   └── anatomy_data.json       # Anatomical details
└── data/
    └── patt.hiro               # AR marker pattern
```

---

## 🎛️ Feature Implementation Guide

### 🔍 Phase 1: Enhanced Zoom System

#### **Zoom State Management**

```typescript
interface ZoomState {
  currentZoom: number; // 0.5x to 3.0x range
  isAnimating: boolean; // Animation lock
  thresholds: {
    normalView: 1.0; // Default heart view
    startSlicing: 1.5; // Begin heart separation
    showLabels: 2.0; // Display anatomical labels
    maxDetail: 2.5; // Full medical information
  };
}
```

#### **Button Controls Implementation**

```typescript
// Zoom button component
const ZoomControls = () => {
  const handleZoomIn = () => {
    if (currentZoom < 3.0) {
      animateZoom(currentZoom + 0.2);
    }
  };

  const handleZoomOut = () => {
    if (currentZoom > 0.5) {
      animateZoom(currentZoom - 0.2);
    }
  };

  return (
    <div className="zoom-controls">
      <button onClick={handleZoomIn}>🔍+</button>
      <button onClick={handleZoomOut}>🔍-</button>
    </div>
  );
};
```

#### **Touch/Gesture Controls**

```typescript
// Pinch-to-zoom implementation
const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    initialDistance = getDistance(e.touches[0], e.touches[1]);
    isPinching = true;
  }
};

const handleTouchMove = (e: TouchEvent) => {
  if (isPinching && e.touches.length === 2) {
    const currentDistance = getDistance(e.touches[0], e.touches[1]);
    const scale = currentDistance / initialDistance;
    const newZoom = Math.max(0.5, Math.min(3.0, baseZoom * scale));
    updateZoom(newZoom);
  }
};
```

### 🔪 Phase 2: Heart Slicing Animation

#### **3D Model Requirements**

You need these heart models:

1. **Complete Heart** (`/public/realistic_human_heart/scene.gltf`)
2. **Sliced Heart Parts** (create separate models for chambers)
3. **Label Points** (3D markers for anatomical features)

#### **Animation Sequence Logic**

```typescript
const handleZoomChange = (zoomLevel: number) => {
  if (zoomLevel >= 1.5 && zoomLevel < 2.0) {
    // Start slicing animation
    startHeartSlicing();
  } else if (zoomLevel >= 2.0) {
    // Show anatomical labels
    showAnatomicalLabels();
  } else {
    // Return to complete heart
    showCompleteHeart();
  }
};

const startHeartSlicing = () => {
  // Animate heart parts separation
  heartChambers.forEach((chamber, index) => {
    animateToPosition(chamber, separationPositions[index]);
  });
};
```

#### **Three.js Animation Implementation**

```typescript
const animateHeartSlicing = () => {
  // Find heart parts by name
  const leftAtrium = heartModel.getObjectByName("LeftAtrium");
  const rightAtrium = heartModel.getObjectByName("RightAtrium");
  const leftVentricle = heartModel.getObjectByName("LeftVentricle");
  const rightVentricle = heartModel.getObjectByName("RightVentricle");

  // Animate separation
  gsap.to(leftAtrium.position, {
    duration: 1.5,
    x: -0.3,
    y: 0.2,
    ease: "power2.out",
  });

  gsap.to(rightAtrium.position, {
    duration: 1.5,
    x: 0.3,
    y: 0.2,
    ease: "power2.out",
  });

  // Continue for other chambers...
};
```

### 🏷️ Phase 3: Anatomical Labeling System

#### **Heart Parts Database**

```typescript
interface HeartPart {
  id: string;
  name: string;
  position: Vector3;
  description: string;
  function: string;
  diseases: string[];
}

const heartParts: HeartPart[] = [
  {
    id: "left_atrium",
    name: "Left Atrium",
    position: new THREE.Vector3(-0.2, 0.3, 0),
    description: "Receives oxygenated blood from lungs",
    function: "Blood collection chamber",
    diseases: ["Atrial Fibrillation", "Mitral Stenosis"],
  },
  // ... other heart parts
];
```

#### **Label Implementation**

```typescript
const createAnatomicalLabels = () => {
  heartParts.forEach((part) => {
    // Create arrow pointing to heart part
    const arrow = createArrow(part.position);

    // Create text label
    const label = createTextLabel(part.name);

    // Position label relative to heart
    label.position.copy(part.position);
    label.position.add(new THREE.Vector3(0.5, 0.2, 0));

    // Add click interaction
    label.userData = { heartPart: part };
    interactiveObjects.push(label);

    scene.add(arrow);
    scene.add(label);
  });
};
```

### 📊 Phase 4: Medical Information System

#### **Disease Database Structure**

```typescript
interface HeartDisease {
  id: string;
  name: string;
  category: "structural" | "rhythm" | "vascular" | "infection";
  severity: "mild" | "moderate" | "severe";
  symptoms: string[];
  causes: string[];
  prevention: string[];
  treatment: string[];
  prevalence: string;
  ageGroup: string;
}

const heartDiseases: HeartDisease[] = [
  {
    id: "coronary_artery_disease",
    name: "Coronary Artery Disease",
    category: "vascular",
    severity: "severe",
    symptoms: [
      "Chest pain or discomfort",
      "Shortness of breath",
      "Fatigue",
      "Irregular heartbeat",
    ],
    causes: [
      "Plaque buildup in arteries",
      "High cholesterol",
      "High blood pressure",
      "Smoking",
    ],
    prevention: [
      "Regular exercise",
      "Healthy diet",
      "No smoking",
      "Stress management",
    ],
    treatment: [
      "Medications",
      "Angioplasty",
      "Bypass surgery",
      "Lifestyle changes",
    ],
    prevalence: "6.2% of adults in US",
    ageGroup: "Most common after age 40",
  },
  // ... more diseases
];
```

#### **Information Panel Component**

```typescript
const ARInfoPanel = ({ selectedPart, zoomLevel }) => {
  const [activeTab, setActiveTab] = useState("anatomy");

  return (
    <div className="ar-info-panel">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={activeTab === "anatomy" ? "active" : ""}
          onClick={() => setActiveTab("anatomy")}
        >
          Anatomy
        </button>
        <button
          className={activeTab === "diseases" ? "active" : ""}
          onClick={() => setActiveTab("diseases")}
        >
          Diseases
        </button>
        <button
          className={activeTab === "prevention" ? "active" : ""}
          onClick={() => setActiveTab("prevention")}
        >
          Prevention
        </button>
      </div>

      {/* Content Display */}
      <div className="panel-content">
        {activeTab === "anatomy" && <AnatomyInfo part={selectedPart} />}
        {activeTab === "diseases" && (
          <DiseaseInfo diseases={getRelatedDiseases(selectedPart)} />
        )}
        {activeTab === "prevention" && <PreventionTips />}
      </div>
    </div>
  );
};
```

---

## 🔄 Development Workflow

### **Phase-by-Phase Implementation**

#### **Week 1: Foundation Setup**

1. **Day 1-2**: Set up zoom controls and state management
2. **Day 3-4**: Implement smooth scaling animations
3. **Day 5-7**: Add touch/pinch gesture support and testing

#### **Week 2: 3D Animation System**

1. **Day 1-3**: Create heart slicing mechanics and part separation
2. **Day 4-5**: Implement Three.js animations and transitions
3. **Day 6-7**: Optimize model loading and performance

#### **Week 3: Labeling and Interaction**

1. **Day 1-3**: Build anatomical labeling system with arrows
2. **Day 4-5**: Add interactive tooltips and part highlighting
3. **Day 6-7**: Implement click/touch interactions for labels

#### **Week 4: Medical Content Integration**

1. **Day 1-3**: Create information panels and disease database
2. **Day 4-5**: Add educational content and prevention tips
3. **Day 6-7**: UI polish, testing, and capstone preparation

### **Quality Assurance Process**

#### **Testing Checklist**

- [ ] AR marker detection works consistently
- [ ] Zoom controls respond smoothly (button + touch)
- [ ] Heart slicing animation triggers at correct zoom level
- [ ] All anatomical labels display properly
- [ ] Medical information loads without errors
- [ ] Touch interactions work on mobile devices
- [ ] Performance maintains 30+ FPS during animations
- [ ] Camera permissions handle gracefully
- [ ] Fallback displays when model loading fails

#### **Performance Optimization**

```typescript
// Model optimization
const optimizeHeartModel = (model) => {
  // Reduce geometry complexity for mobile
  model.traverse((child) => {
    if (child.isMesh) {
      child.geometry = simplifyGeometry(child.geometry);
      child.material.transparent = true;
      child.castShadow = true;
    }
  });
};

// Memory management
const cleanupARResources = () => {
  // Dispose geometries and materials
  scene.traverse((object) => {
    if (object.geometry) object.geometry.dispose();
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((material) => material.dispose());
      } else {
        object.material.dispose();
      }
    }
  });

  // Clear scene
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }

  // Dispose renderer
  renderer.dispose();
};
```

---

## 🎓 Capstone Presentation Guide

### **Demo Flow for Panelists**

1. **Introduction** (2 minutes)

   - Show application overview and AR setup
   - Explain educational objectives

2. **Basic AR Functionality** (3 minutes)

   - Demonstrate marker detection
   - Show heart model loading and rotation

3. **Interactive Zoom System** (4 minutes)

   - Use button controls for zoom
   - Demonstrate touch/pinch gestures
   - Show smooth animations

4. **Heart Slicing Feature** (5 minutes)

   - Zoom to trigger slicing animation
   - Explain anatomical separation
   - Show internal heart structures

5. **Educational Content** (4 minutes)

   - Display anatomical labels
   - Show disease information panels
   - Demonstrate prevention tips

6. **Technical Excellence** (2 minutes)
   - Highlight performance optimization
   - Show responsive design features
   - Demonstrate error handling

### **Key Talking Points**

- **Innovation**: "First AR heart visualization with dynamic slicing"
- **Education**: "Interactive learning improves retention by 300%"
- **Technology**: "WebAR accessibility without app downloads"
- **Medical Accuracy**: "Anatomically correct models with verified data"
- **User Experience**: "Intuitive controls suitable for all age groups"

### **Backup Plans**

- **No Camera**: Pre-recorded video demonstration
- **Marker Issues**: Digital marker display on second device
- **Performance**: Reduced quality fallback models
- **Network**: Offline mode with cached models

---

## 🛠️ Technical Dependencies

### **Core Technologies**

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "typescript": "^5.0.0",
    "three": "^0.150.0",
    "vite": "^4.0.0",
    "@types/three": "^0.150.0"
  },
  "AR Libraries": {
    "THREEAR": "Local implementation",
    "WebGL": "Browser native",
    "WebRTC": "Camera access"
  },
  "Animation": {
    "gsap": "^3.12.0",
    "three/examples/controls": "OrbitControls"
  }
}
```

### **Browser Support**

- **Chrome**: 90+ (Recommended)
- **Firefox**: 88+ (Good)
- **Safari**: 14+ (Limited)
- **Edge**: 90+ (Good)
- **Mobile**: iOS 14+, Android 8+

---

## 📝 Deployment & Production

### **Build Process**

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Deploy to hosting service
npm run deploy
```

### **Environment Variables**

```env
VITE_AR_DEBUG=false
VITE_MODEL_CDN_URL=https://your-cdn.com/models/
VITE_ANALYTICS_ID=your-analytics-id
```

### **Performance Monitoring**

- **Loading Times**: < 3 seconds for heart model
- **Frame Rate**: 30+ FPS during animations
- **Memory Usage**: < 100MB total
- **AR Tracking**: 95%+ marker detection accuracy

---

## 📧 Support & Documentation

### **Project Team**

- **Developer**: Mary Cabalquinto
- **Project Type**: Capstone Project
- **Institution**: [Your University]
- **Date**: June 2025

### **Additional Resources**

- [Three.js Documentation](https://threejs.org/docs/)
- [THREEAR Examples](base_folder/THREEAR-master/examples/)
- [Heart Anatomy Reference](medical_data/)
- [Performance Best Practices](docs/performance.md)

---

**🎯 Project Goal**: Create an innovative AR educational tool that revolutionizes how students learn heart anatomy through interactive 3D visualization, setting new standards for medical education technology.

### 📁 Project Structure

```
src/
├── assets/
│   ├── components/
│   │   ├── organData.ts          # Organ definitions and paths
│   │   ├── HeartData.ts          # Heart-specific medical data
│   │   ├── ARControls.tsx        # Zoom and interaction controls
│   │   ├── ARInfoPanel.tsx       # Medical information display
│   │   └── ARLabels.tsx          # Anatomical labeling system
│   ├── pages/
│   │   ├── ARScannerPage.tsx     # Main AR interface
│   │   ├── ScanExploreHub.tsx    # Organ selection hub
│   │   └── OrganDetailPage.tsx   # Individual organ details
│   └── styles/
│       └── ARInterface.css       # AR-specific styling
├── utils/
│   ├── ARHelpers.ts             # AR utility functions
│   ├── ZoomController.ts        # Zoom logic and animations
│   └── HeartAnimations.ts       # Heart slicing animations
└── types/
    ├── HeartTypes.ts            # TypeScript interfaces
    └── ARTypes.ts               # AR-specific type definitions

public/
├── heart_models/
│   ├── complete_heart.gltf      # Main heart model
│   ├── heart_chambers.gltf      # Sliced heart parts
│   └── heart_labels.json       # Label positioning data
├── medical_data/
│   ├── heart_diseases.json     # Disease information
│   └── anatomy_data.json       # Anatomical details
└── data/
    └── patt.hiro               # AR marker pattern
```

---

## 🎛️ Feature Implementation Guide

### 🔍 Phase 1: Enhanced Zoom System

#### **Zoom State Management**

```typescript
interface ZoomState {
  currentZoom: number; // 0.5x to 3.0x range
  isAnimating: boolean; // Animation lock
  thresholds: {
    normalView: 1.0; // Default heart view
    startSlicing: 1.5; // Begin heart separation
    showLabels: 2.0; // Display anatomical labels
    maxDetail: 2.5; // Full medical information
  };
}
```

#### **Button Controls Implementation**

```typescript
// Zoom button component
const ZoomControls = () => {
  const handleZoomIn = () => {
    if (currentZoom < 3.0) {
      animateZoom(currentZoom + 0.2);
    }
  };

  const handleZoomOut = () => {
    if (currentZoom > 0.5) {
      animateZoom(currentZoom - 0.2);
    }
  };

  return (
    <div className="zoom-controls">
      <button onClick={handleZoomIn}>🔍+</button>
      <button onClick={handleZoomOut}>🔍-</button>
    </div>
  );
};
```

#### **Touch/Gesture Controls**

```typescript
// Pinch-to-zoom implementation
const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    initialDistance = getDistance(e.touches[0], e.touches[1]);
    isPinching = true;
  }
};

const handleTouchMove = (e: TouchEvent) => {
  if (isPinching && e.touches.length === 2) {
    const currentDistance = getDistance(e.touches[0], e.touches[1]);
    const scale = currentDistance / initialDistance;
    const newZoom = Math.max(0.5, Math.min(3.0, baseZoom * scale));
    updateZoom(newZoom);
  }
};
```

### 🔪 Phase 2: Heart Slicing Animation

#### **3D Model Requirements**

You need these heart models:

1. **Complete Heart** (`/public/realistic_human_heart/scene.gltf`)
2. **Sliced Heart Parts** (create separate models for chambers)
3. **Label Points** (3D markers for anatomical features)

#### **Animation Sequence Logic**

```typescript
const handleZoomChange = (zoomLevel: number) => {
  if (zoomLevel >= 1.5 && zoomLevel < 2.0) {
    // Start slicing animation
    startHeartSlicing();
  } else if (zoomLevel >= 2.0) {
    // Show anatomical labels
    showAnatomicalLabels();
  } else {
    // Return to complete heart
    showCompleteHeart();
  }
};

const startHeartSlicing = () => {
  // Animate heart parts separation
  heartChambers.forEach((chamber, index) => {
    animateToPosition(chamber, separationPositions[index]);
  });
};
```

#### **Three.js Animation Implementation**

```typescript
const animateHeartSlicing = () => {
  // Find heart parts by name
  const leftAtrium = heartModel.getObjectByName("LeftAtrium");
  const rightAtrium = heartModel.getObjectByName("RightAtrium");
  const leftVentricle = heartModel.getObjectByName("LeftVentricle");
  const rightVentricle = heartModel.getObjectByName("RightVentricle");

  // Animate separation
  gsap.to(leftAtrium.position, {
    duration: 1.5,
    x: -0.3,
    y: 0.2,
    ease: "power2.out",
  });

  gsap.to(rightAtrium.position, {
    duration: 1.5,
    x: 0.3,
    y: 0.2,
    ease: "power2.out",
  });

  // Continue for other chambers...
};
```

### 🏷️ Phase 3: Anatomical Labeling System

#### **Heart Parts Database**

```typescript
interface HeartPart {
  id: string;
  name: string;
  position: Vector3;
  description: string;
  function: string;
  diseases: string[];
}

const heartParts: HeartPart[] = [
  {
    id: "left_atrium",
    name: "Left Atrium",
    position: new THREE.Vector3(-0.2, 0.3, 0),
    description: "Receives oxygenated blood from lungs",
    function: "Blood collection chamber",
    diseases: ["Atrial Fibrillation", "Mitral Stenosis"],
  },
  // ... other heart parts
];
```

#### **Label Implementation**

```typescript
const createAnatomicalLabels = () => {
  heartParts.forEach((part) => {
    // Create arrow pointing to heart part
    const arrow = createArrow(part.position);

    // Create text label
    const label = createTextLabel(part.name);

    // Position label relative to heart
    label.position.copy(part.position);
    label.position.add(new THREE.Vector3(0.5, 0.2, 0));

    // Add click interaction
    label.userData = { heartPart: part };
    interactiveObjects.push(label);

    scene.add(arrow);
    scene.add(label);
  });
};
```

### 📊 Phase 4: Medical Information System

#### **Disease Database Structure**

```typescript
interface HeartDisease {
  id: string;
  name: string;
  category: "structural" | "rhythm" | "vascular" | "infection";
  severity: "mild" | "moderate" | "severe";
  symptoms: string[];
  causes: string[];
  prevention: string[];
  treatment: string[];
  prevalence: string;
  ageGroup: string;
}

const heartDiseases: HeartDisease[] = [
  {
    id: "coronary_artery_disease",
    name: "Coronary Artery Disease",
    category: "vascular",
    severity: "severe",
    symptoms: [
      "Chest pain or discomfort",
      "Shortness of breath",
      "Fatigue",
      "Irregular heartbeat",
    ],
    causes: [
      "Plaque buildup in arteries",
      "High cholesterol",
      "High blood pressure",
      "Smoking",
    ],
    prevention: [
      "Regular exercise",
      "Healthy diet",
      "No smoking",
      "Stress management",
    ],
    treatment: [
      "Medications",
      "Angioplasty",
      "Bypass surgery",
      "Lifestyle changes",
    ],
    prevalence: "6.2% of adults in US",
    ageGroup: "Most common after age 40",
  },
  // ... more diseases
];
```

#### **Information Panel Component**

```typescript
const ARInfoPanel = ({ selectedPart, zoomLevel }) => {
  const [activeTab, setActiveTab] = useState("anatomy");

  return (
    <div className="ar-info-panel">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={activeTab === "anatomy" ? "active" : ""}
          onClick={() => setActiveTab("anatomy")}
        >
          Anatomy
        </button>
        <button
          className={activeTab === "diseases" ? "active" : ""}
          onClick={() => setActiveTab("diseases")}
        >
          Diseases
        </button>
        <button
          className={activeTab === "prevention" ? "active" : ""}
          onClick={() => setActiveTab("prevention")}
        >
          Prevention
        </button>
      </div>

      {/* Content Display */}
      <div className="panel-content">
        {activeTab === "anatomy" && <AnatomyInfo part={selectedPart} />}
        {activeTab === "diseases" && (
          <DiseaseInfo diseases={getRelatedDiseases(selectedPart)} />
        )}
        {activeTab === "prevention" && <PreventionTips />}
      </div>
    </div>
  );
};
```

---

## 🔄 Development Workflow

### **Phase-by-Phase Implementation**

#### **Week 1: Foundation Setup**

1. **Day 1-2**: Set up zoom controls and state management
2. **Day 3-4**: Implement smooth scaling animations
3. **Day 5-7**: Add touch/pinch gesture support and testing

#### **Week 2: 3D Animation System**

1. **Day 1-3**: Create heart slicing mechanics and part separation
2. **Day 4-5**: Implement Three.js animations and transitions
3. **Day 6-7**: Optimize model loading and performance

#### **Week 3: Labeling and Interaction**

1. **Day 1-3**: Build anatomical labeling system with arrows
2. **Day 4-5**: Add interactive tooltips and part highlighting
3. **Day 6-7**: Implement click/touch interactions for labels

#### **Week 4: Medical Content Integration**

1. **Day 1-3**: Create information panels and disease database
2. **Day 4-5**: Add educational content and prevention tips
3. **Day 6-7**: UI polish, testing, and capstone preparation

### **Quality Assurance Process**

#### **Testing Checklist**

- [ ] AR marker detection works consistently
- [ ] Zoom controls respond smoothly (button + touch)
- [ ] Heart slicing animation triggers at correct zoom level
- [ ] All anatomical labels display properly
- [ ] Medical information loads without errors
- [ ] Touch interactions work on mobile devices
- [ ] Performance maintains 30+ FPS during animations
- [ ] Camera permissions handle gracefully
- [ ] Fallback displays when model loading fails

#### **Performance Optimization**

```typescript
// Model optimization
const optimizeHeartModel = (model) => {
  // Reduce geometry complexity for mobile
  model.traverse((child) => {
    if (child.isMesh) {
      child.geometry = simplifyGeometry(child.geometry);
      child.material.transparent = true;
      child.castShadow = true;
    }
  });
};

// Memory management
const cleanupARResources = () => {
  // Dispose geometries and materials
  scene.traverse((object) => {
    if (object.geometry) object.geometry.dispose();
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((material) => material.dispose());
      } else {
        object.material.dispose();
      }
    }
  });

  // Clear scene
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }

  // Dispose renderer
  renderer.dispose();
};
```

---

## 🎓 Capstone Presentation Guide

### **Demo Flow for Panelists**

1. **Introduction** (2 minutes)

   - Show application overview and AR setup
   - Explain educational objectives

2. **Basic AR Functionality** (3 minutes)

   - Demonstrate marker detection
   - Show heart model loading and rotation

3. **Interactive Zoom System** (4 minutes)

   - Use button controls for zoom
   - Demonstrate touch/pinch gestures
   - Show smooth animations

4. **Heart Slicing Feature** (5 minutes)

   - Zoom to trigger slicing animation
   - Explain anatomical separation
   - Show internal heart structures

5. **Educational Content** (4 minutes)

   - Display anatomical labels
   - Show disease information panels
   - Demonstrate prevention tips

6. **Technical Excellence** (2 minutes)
   - Highlight performance optimization
   - Show responsive design features
   - Demonstrate error handling

### **Key Talking Points**

- **Innovation**: "First AR heart visualization with dynamic slicing"
- **Education**: "Interactive learning improves retention by 300%"
- **Technology**: "WebAR accessibility without app downloads"
- **Medical Accuracy**: "Anatomically correct models with verified data"
- **User Experience**: "Intuitive controls suitable for all age groups"

### **Backup Plans**

- **No Camera**: Pre-recorded video demonstration
- **Marker Issues**: Digital marker display on second device
- **Performance**: Reduced quality fallback models
- **Network**: Offline mode with cached models

---

## 🛠️ Technical Dependencies

### **Core Technologies**

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "typescript": "^5.0.0",
    "three": "^0.150.0",
    "vite": "^4.0.0",
    "@types/three": "^0.150.0"
  },
  "AR Libraries": {
    "THREEAR": "Local implementation",
    "WebGL": "Browser native",
    "WebRTC": "Camera access"
  },
  "Animation": {
    "gsap": "^3.12.0",
    "three/examples/controls": "OrbitControls"
  }
}
```

### **Browser Support**

- **Chrome**: 90+ (Recommended)
- **Firefox**: 88+ (Good)
- **Safari**: 14+ (Limited)
- **Edge**: 90+ (Good)
- **Mobile**: iOS 14+, Android 8+

---

## 📝 Deployment & Production

### **Build Process**

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Deploy to hosting service
npm run deploy
```

### **Environment Variables**

```env
VITE_AR_DEBUG=false
VITE_MODEL_CDN_URL=https://your-cdn.com/models/
VITE_ANALYTICS_ID=your-analytics-id
```

### **Performance Monitoring**

- **Loading Times**: < 3 seconds for heart model
- **Frame Rate**: 30+ FPS during animations
- **Memory Usage**: < 100MB total
- **AR Tracking**: 95%+ marker detection accuracy

---

## 📧 Support & Documentation

### **Project Team**

- **Developer**: Mary Cabalquinto
- **Project Type**: Capstone Project
- **Institution**: [Your University]
- **Date**: June 2025

### **Additional Resources**

- [Three.js Documentation](https://threejs.org/docs/)
- [THREEAR Examples](base_folder/THREEAR-master/examples/)
- [Heart Anatomy Reference](medical_data/)
- [Performance Best Practices](docs/performance.md)

---

**🎯 Project Goal**: Create an innovative AR educational tool that revolutionizes how students learn heart anatomy through interactive 3D visualization, setting new standards for medical education technology.
},
})

```

```
