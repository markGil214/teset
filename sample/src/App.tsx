import { useState, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import { Object3D } from "three";
import "./App.css";

interface HeartPart {
  id: string;
  name: string;
  description: string;
  position: [number, number, number];
  color: string;
}

const heartParts: HeartPart[] = [
  {
    id: "1",
    name: "Aorta",
    description:
      "The main artery that carries oxygenated blood from the left ventricle to the rest of the body.",
    position: [0, 1, 0.5],
    color: "#e74c3c",
  },
  {
    id: "2",
    name: "Superior Vena Cava",
    description:
      "Large vein that carries deoxygenated blood from the upper body back to the right atrium of the heart.",
    position: [-0.5, 0.4, 0.2],
    color: "#3498db",
  },
  {
    id: "3",
    name: "Pulmonary Artery",
    description:
      "Carries deoxygenated blood from the right ventricle to the lungs for oxygenation.",
    position: [1.0, 0.3, 0.2],
    color: "#9b59b6",
  },
  {
    id: "4",
    name: "Right Atrium",
    description:
      "Upper right chamber of the heart that receives deoxygenated blood from the body via the vena cavae.",
    position: [0.2, 0.1, 0.4],
    color: "#2ecc71",
  },
  {
    id: "5",
    name: "Left Atrium",
    description:
      "Upper left chamber of the heart that receives oxygenated blood from the lungs via the pulmonary veins.",
    position: [1.2, 0.0, 0.2],
    color: "#f39c12",
  },
  {
    id: "6",
    name: "Right Ventricle",
    description:
      "Lower right chamber of the heart that pumps deoxygenated blood to the lungs through the pulmonary artery.",
    position: [0.1, -0.4, 0.4],
    color: "#8e44ad",
  },
  {
    id: "7",
    name: "Left Ventricle",
    description:
      "Lower left chamber of the heart that pumps oxygenated blood to the body through the aorta. It has the thickest muscular wall.",
    position: [1.0, -0.2, 0.2],
    color: "#c0392b",
  },
  {
    id: "8",
    name: "Inferior Vena Cava",
    description:
      "Large vein that carries deoxygenated blood from the lower body back to the right atrium of the heart.",
    position: [0.1, -0.7, 0.3],
    color: "#34495e",
  },
];

function HeartModel({ onPartClick }: { onPartClick: (id: string) => void }) {
  const { scene } = useGLTF("/heart.glb");
  const meshRef = useRef<Object3D>(null);

  // Removed the useFrame hook to make the heart static

  return (
    <primitive
      ref={meshRef}
      object={scene}
      scale={2}
      position={[0, -0.5, 0]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onPartClick("heart");
      }}
    />
  );
}

function PartLabel({
  part,
  isSelected,
  onClick,
}: {
  part: HeartPart;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <group position={part.position}>
      <Html
        position={[0.5, 0, 0]}
        style={{
          pointerEvents: "auto",
          userSelect: "none",
        }}
      >
        <div
          className={`label-point ${isSelected ? "selected" : ""}`}
          onClick={onClick}
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: isSelected ? "#f39c12" : part.color,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold",
            border: "2px solid white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
          }}
        >
          {part.id}
        </div>
      </Html>
    </group>
  );
}

function Scene() {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  const handlePartClick = (partId: string) => {
    setSelectedPart(partId === selectedPart ? null : partId);
  };

  const selectedPartData = heartParts.find((part) => part.id === selectedPart);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />

      <Suspense fallback={null}>
        <HeartModel onPartClick={handlePartClick} />

        {heartParts.map((part) => (
          <PartLabel
            key={part.id}
            part={part}
            isSelected={selectedPart === part.id}
            onClick={() => handlePartClick(part.id)}
          />
        ))}
      </Suspense>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={10}
      />

      {selectedPartData && (
        <Html
          position={[0, 2, 0]}
          style={{
            pointerEvents: "none",
            userSelect: "none",
            width: "300px",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(44, 62, 80, 0.95)",
              color: "white",
              padding: "15px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              backdropFilter: "blur(10px)",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0", color: "#f39c12" }}>
              {selectedPartData.name}
            </h3>
            <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.4" }}>
              {selectedPartData.description}
            </p>
          </div>
        </Html>
      )}
    </>
  );
}

function App() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

export default App;
