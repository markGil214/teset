# Phase 3: Interactive Labels and Educational Content Implementation Guide

## Overview

This guide provides a complete roadmap for implementing Phase 3 of the AR Educational Scanner - Interactive labels and educational content. The foundation has been established with the anatomical data structure and AR label component system.

## Current Status ✅

### Completed Components

1. **Enhanced Anatomical Data Structure** (`anatomicalData.ts`)

   - Multilingual support (English/Filipino)
   - Detailed educational content with fun facts
   - System-level information for each organ
   - Interaction mode configuration

2. **AR Label Component System** (`ARLabel.tsx`)

   - Interactive AR labels with positioning
   - Detailed information modals
   - Smooth animations and visual feedback
   - Multilingual content display

3. **Core AR Infrastructure**
   - Stable AR rendering without blinking/flickering
   - 3D model integration with proper lighting
   - Organ-specific scaling and positioning
   - Error handling and loading states

## Implementation Steps

### Step 1: Complete Organ Data (In Progress)

Add remaining organ data to `anatomicalData.ts`:

#### Lungs Educational Data

```typescript
{
  organId: "lungs",
  anatomicalPoints: [
    {
      id: "left-lung",
      position: { x: -0.3, y: 0.1, z: 0 },
      title: {
        en: "Left Lung",
        fil: "Kaliwang Baga"
      },
      description: {
        en: "The left lung has two lobes and is slightly smaller than the right lung",
        fil: "Ang kaliwang baga ay may dalawang lobes at medyo mas maliit kaysa sa kanang baga"
      },
      detailedInfo: {
        en: "The left lung is divided into two lobes (upper and lower) to make room for the heart. It has about 300 million alveoli for gas exchange.",
        fil: "Ang kaliwang baga ay nahahati sa dalawang lobes (upper at lower) upang magbigay ng lugar para sa puso. May humigit-kumulang 300 milyong alveoli para sa gas exchange."
      },
      funFact: {
        en: "Your left lung is about 10% smaller than your right lung!",
        fil: "Ang inyong kaliwang baga ay humigit-kumulang 10% na mas maliit kaysa sa kanang baga!"
      }
    },
    // Add more lung anatomical points...
  ],
  systemInformation: {
    title: {
      en: "Respiratory System",
      fil: "Respiratory System"
    },
    // Complete respiratory system info...
  }
}
```

#### Kidney Educational Data

```typescript
{
  organId: "kidney",
  anatomicalPoints: [
    {
      id: "renal-cortex",
      position: { x: 0, y: 0.3, z: 0 },
      title: {
        en: "Renal Cortex",
        fil: "Renal Cortex"
      },
      // Complete kidney data...
    }
  ]
}
```

#### Skin Educational Data

```typescript
{
  organId: "skin",
  anatomicalPoints: [
    {
      id: "epidermis",
      position: { x: 0, y: 0.4, z: 0 },
      title: {
        en: "Epidermis",
        fil: "Epidermis"
      },
      // Complete skin data...
    }
  ]
}
```

### Step 2: Integrate AR Labels into ARScannerPage ⭐ PRIORITY

#### Add State Management

```typescript
// Add to ARScannerPage.tsx imports
import ARLabel from "../components/ARLabel";
import { anatomicalEducationalData } from "../data/anatomicalData";

// Add state variables
const [showLabels, setShowLabels] = useState(false);
const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
const [language, setLanguage] = useState<"en" | "fil">("en");
const [labelPositions, setLabelPositions] = useState<{
  [key: string]: { x: number; y: number };
}>({});
```

#### Add Label Positioning Logic

```typescript
// Function to convert 3D world positions to 2D screen positions
const updateLabelPositions = (markerGroup: any, camera: any, renderer: any) => {
  if (!markerGroup.organModel || !showLabels) return;

  const currentOrganData = anatomicalEducationalData.find(
    (data) => data.organId === organId
  );

  if (!currentOrganData) return;

  const newPositions: { [key: string]: { x: number; y: number } } = {};

  currentOrganData.anatomicalPoints.forEach((point) => {
    // Create a 3D vector at the anatomical point position
    const vector = new window.THREE.Vector3(
      point.position.x,
      point.position.y,
      point.position.z
    );

    // Apply the marker group's transform
    vector.applyMatrix4(markerGroup.matrixWorld);

    // Project to screen coordinates
    vector.project(camera);

    // Convert to screen pixels
    const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    const y = (vector.y * -0.5 + 0.5) * renderer.domElement.clientHeight;

    newPositions[point.id] = { x, y };
  });

  setLabelPositions(newPositions);
};
```

#### Integrate into Animation Loop

```typescript
// In the animation loop, after controller.update
controller.update(source.domElement);

// Update label positions
updateLabelPositions(markerGroup, camera, renderer);

// Existing model rotation code...
```

#### Add Label Rendering

```typescript
// Add to the JSX return, after the text overlay div
{
  showLabels &&
    anatomicalEducationalData
      .find((data) => data.organId === organId)
      ?.anatomicalPoints.map((point) => (
        <ARLabel
          key={point.id}
          point={point}
          language={language}
          screenPosition={labelPositions[point.id] || { x: 0, y: 0 }}
          isVisible={!!labelPositions[point.id]}
          onClick={() =>
            setSelectedLabelId(selectedLabelId === point.id ? null : point.id)
          }
          isSelected={selectedLabelId === point.id}
        />
      ));
}
```

### Step 3: Add Interactive Controls

#### Language Toggle

```typescript
// Add language toggle button
<button
  onClick={() => setLanguage(language === "en" ? "fil" : "en")}
  style={{
    position: "absolute",
    top: "10px",
    right: "10px",
    padding: "8px 12px",
    backgroundColor: "rgba(0, 123, 255, 0.8)",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    zIndex: 101,
  }}
>
  {language === "en" ? "🇵🇭 Filipino" : "🇺🇸 English"}
</button>
```

#### Labels Toggle

```typescript
// Add labels toggle button
<button
  onClick={() => setShowLabels(!showLabels)}
  style={{
    position: "absolute",
    top: "50px",
    right: "10px",
    padding: "8px 12px",
    backgroundColor: showLabels
      ? "rgba(40, 167, 69, 0.8)"
      : "rgba(108, 117, 125, 0.8)",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    zIndex: 101,
  }}
>
  {showLabels ? "🏷️ Hide Labels" : "🏷️ Show Labels"}
</button>
```

### Step 4: Implement Audio Narration System

#### Audio Service Creation

```typescript
// Create src/assets/services/audioService.ts
export class AudioService {
  private static instance: AudioService;
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  async playNarration(
    audioFile: string,
    language: "en" | "fil"
  ): Promise<void> {
    this.stopCurrentAudio();

    const audioPath = `/audio/${language}/${audioFile}`;

    try {
      this.currentAudio = new Audio(audioPath);
      this.currentAudio.volume = 0.7;
      await this.currentAudio.play();
    } catch (error) {
      console.warn("Audio playback failed:", error);
    }
  }

  stopCurrentAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }
}
```

#### Add Audio Files Structure

```
public/
├── audio/
│   ├── en/
│   │   ├── heart_introduction.mp3
│   │   ├── left_ventricle.mp3
│   │   ├── right_ventricle.mp3
│   │   └── ...
│   └── fil/
│       ├── heart_introduction.mp3
│       ├── left_ventricle.mp3
│       └── ...
```

### Step 5: Add Educational Content Overlay System

#### System Information Panel

```typescript
// Add to ARScannerPage state
const [showSystemInfo, setShowSystemInfo] = useState(false);

// System info component
const SystemInfoPanel = () => {
  const organData = anatomicalEducationalData.find(
    (data) => data.organId === organId
  );
  if (!organData || !showSystemInfo) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        right: "20px",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        color: "white",
        padding: "20px",
        borderRadius: "12px",
        zIndex: 200,
        maxHeight: "40vh",
        overflow: "auto",
      }}
    >
      <h3>{organData.systemInformation.title[language]}</h3>
      <p>{organData.systemInformation.description[language]}</p>

      <h4>Key Functions:</h4>
      <ul>
        {organData.systemInformation.keyFunctions[language].map(
          (func, index) => (
            <li key={index}>{func}</li>
          )
        )}
      </ul>

      <button
        onClick={() => setShowSystemInfo(false)}
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          backgroundColor: "#ff6b6b",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Close
      </button>
    </div>
  );
};
```

### Step 6: Implement Advanced Interaction Modes

#### Cutaway View Implementation

```typescript
// Add to anatomical data
const enableCutawayView = (model: any, organData: OrganEducationalData) => {
  if (!organData.interactionModes.cutaway) return;

  // Implement clipping planes for cutaway views
  const clipPlane = new window.THREE.Plane(
    new window.THREE.Vector3(1, 0, 0),
    0
  );

  model.traverse((child: any) => {
    if (child.isMesh) {
      child.material = child.material.clone();
      child.material.clippingPlanes = [clipPlane];
    }
  });
};
```

#### X-Ray Mode Implementation

```typescript
const enableXRayMode = (model: any, enabled: boolean) => {
  model.traverse((child: any) => {
    if (child.isMesh) {
      if (enabled) {
        child.material = new window.THREE.MeshBasicMaterial({
          color: 0x00ff00,
          transparent: true,
          opacity: 0.3,
          wireframe: true,
        });
      } else {
        // Restore original material
        child.material = child.originalMaterial || child.material;
      }
    }
  });
};
```

### Step 7: Performance Optimization

#### Label Culling

```typescript
// Only update visible labels
const isLabelVisible = (position: { x: number; y: number }) => {
  return (
    position.x > 0 &&
    position.x < window.innerWidth &&
    position.y > 0 &&
    position.y < window.innerHeight
  );
};
```

#### Efficient Re-rendering

```typescript
// Use React.memo for AR labels
export default React.memo(ARLabel);

// Throttle position updates
const throttledUpdatePositions = useCallback(
  throttle(updateLabelPositions, 16), // 60fps
  [markerGroup, camera, renderer]
);
```

### Step 8: Testing and Quality Assurance

#### Testing Checklist

- [ ] AR marker detection works smoothly
- [ ] 3D models load correctly for all organs
- [ ] Labels appear at correct positions
- [ ] Language switching works properly
- [ ] Audio narration plays without errors
- [ ] Performance is smooth on target devices
- [ ] Interactive modes function correctly
- [ ] Error handling works for failed loads

### Step 9: Documentation and Deployment

#### User Guide Creation

```markdown
# AR Educational Scanner User Guide

## Getting Started

1. Print or display the Hiro marker
2. Point your device camera at the marker
3. Select an organ to explore

## Features

- **Interactive Labels**: Tap the blue dots to learn about organ parts
- **Language Support**: Switch between English and Filipino
- **Audio Narration**: Listen to detailed explanations
- **System Information**: Learn about organ systems
```

## Implementation Timeline

### Week 1: Core Integration

- [ ] Complete remaining organ data (lungs, kidney, skin)
- [ ] Integrate AR labels into ARScannerPage
- [ ] Add basic interactive controls

### Week 2: Advanced Features

- [ ] Implement audio narration system
- [ ] Add educational content overlays
- [ ] Create system information panels

### Week 3: Interaction Modes

- [ ] Implement cutaway views
- [ ] Add X-ray mode functionality
- [ ] Create interaction mode controls

### Week 4: Polish and Testing

- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Documentation and deployment

## Technical Requirements

### Dependencies

```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "three": "^0.150.0",
  "typescript": "^4.9.0"
}
```

### File Structure

```
src/
├── assets/
│   ├── components/
│   │   ├── ARLabel.tsx ✅
│   │   └── organData.ts ✅
│   ├── data/
│   │   └── anatomicalData.ts ✅ (needs completion)
│   ├── pages/
│   │   └── ARScannerPage.tsx ✅ (needs integration)
│   └── services/
│       └── audioService.ts (to be created)
└── public/
    ├── audio/ (to be created)
    ├── data/
    │   └── patt.hiro ✅
    └── THREEAR.js ✅
```

## Next Steps for Implementation

1. **Immediate Priority**: Complete the AR label integration in ARScannerPage.tsx
2. **Secondary**: Add remaining organ data for lungs, kidney, and skin
3. **Enhancement**: Implement audio narration system
4. **Advanced**: Add interaction modes and educational overlays

This comprehensive guide provides the roadmap for completing Phase 3 of the AR Educational Scanner with interactive labels and educational content.
