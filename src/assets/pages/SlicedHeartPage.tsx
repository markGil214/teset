import React, { useState, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import { Object3D } from "three";
import { useNavigate } from "react-router-dom";

interface HeartPart {
  id: string;
  name: string;
  description: string;
  position: [number, number, number];
  color: string;
  detailedInfo: string;
}

const heartParts: HeartPart[] = [
  {
    id: "1",
    name: "Aorta",
    description: "The main artery that carries oxygenated blood from the left ventricle to the rest of the body.",
    position: [0, 1, 0.5],
    color: "#e74c3c",
    detailedInfo: "The aorta is the largest artery in the human body, with a diameter of about 3 cm. It has three main sections: ascending aorta, aortic arch, and descending aorta. Blood pressure here is highest in the circulatory system."
  },
  {
    id: "2",
    name: "Superior Vena Cava",
    description: "Large vein that carries deoxygenated blood from the upper body back to the right atrium.",
    position: [-0.5, 0.4, 0.2],
    color: "#3498db",
    detailedInfo: "The superior vena cava is formed by the junction of the left and right brachiocephalic veins. It returns blood from the head, neck, arms, and upper chest to the heart."
  },
  {
    id: "3",
    name: "Pulmonary Artery",
    description: "Carries deoxygenated blood from the right ventricle to the lungs for oxygenation.",
    position: [1.0, 0.3, 0.2],
    color: "#9b59b6",
    detailedInfo: "The pulmonary artery is unique as it's the only artery that carries deoxygenated blood. It splits into left and right branches to supply both lungs with blood for gas exchange."
  },
  {
    id: "4",
    name: "Right Atrium",
    description: "Upper right chamber that receives deoxygenated blood from the body via the vena cavae.",
    position: [0.2, 0.1, 0.4],
    color: "#2ecc71",
    detailedInfo: "The right atrium has thinner walls than the ventricles and contains the sinoatrial (SA) node, the heart's natural pacemaker that initiates each heartbeat."
  },
  {
    id: "5",
    name: "Left Atrium",
    description: "Upper left chamber that receives oxygenated blood from the lungs via pulmonary veins.",
    position: [1.2, 0.0, 0.2],
    color: "#f39c12",
    detailedInfo: "The left atrium receives oxygen-rich blood from four pulmonary veins. It has slightly thicker walls than the right atrium due to higher pressure requirements."
  },
  {
    id: "6",
    name: "Right Ventricle",
    description: "Lower right chamber that pumps deoxygenated blood to the lungs through the pulmonary artery.",
    position: [0.1, -0.4, 0.4],
    color: "#8e44ad",
    detailedInfo: "The right ventricle has a triangular shape and thinner walls than the left ventricle. It generates lower pressure as it only needs to pump blood to the nearby lungs."
  },
  {
    id: "7",
    name: "Left Ventricle",
    description: "Lower left chamber that pumps oxygenated blood to the body through the aorta.",
    position: [1.0, -0.2, 0.2],
    color: "#c0392b",
    detailedInfo: "The left ventricle has the thickest muscular walls (8-12mm) as it needs to generate high pressure to pump blood throughout the entire body. It's the heart's main pumping chamber."
  },
  {
    id: "8",
    name: "Inferior Vena Cava",
    description: "Large vein that carries deoxygenated blood from the lower body back to the right atrium.",
    position: [0.1, -0.7, 0.3],
    color: "#34495e",
    detailedInfo: "The inferior vena cava is the largest vein in the human body, collecting blood from the abdomen, pelvis, and legs. It enters the right atrium from below."
  },
];

function SlicedHeartModel({ onPartClick }: { onPartClick: (id: string) => void }) {
  const gltf = useGLTF("/sliced_organs/heart.glb");
  const meshRef = useRef<Object3D>(null);
  const [error, setError] = useState<Error | null>(null);

  // Clone the scene to avoid issues with reusing the same object
  const clonedScene = React.useMemo(() => {
    try {
      if (gltf?.scene) {
        return gltf.scene.clone();
      }
      return null;
    } catch (err) {
      console.error("Error cloning scene:", err);
      setError(err as Error);
      return null;
    }
  }, [gltf]);

  React.useEffect(() => {
    if (gltf?.scene) {
      console.log("Sliced heart model loaded successfully:", gltf.scene);
    }
  }, [gltf]);

  if (error) {
    console.error("Error with sliced heart model:", error);
    return (
      <Html center>
        <div style={{ 
          color: "red", 
          fontSize: "16px", 
          textAlign: "center",
          padding: "15px",
          backgroundColor: "rgba(0,0,0,0.8)",
          borderRadius: "8px"
        }}>
          Failed to load sliced heart model
        </div>
      </Html>
    );
  }

  if (!clonedScene) {
    return (
      <Html center>
        <div style={{ 
          color: "white", 
          fontSize: "16px", 
          textAlign: "center",
          padding: "15px",
          backgroundColor: "rgba(0,0,0,0.8)",
          borderRadius: "8px"
        }}>
          Loading sliced heart model...
        </div>
      </Html>
    );
  }

  return (
    <primitive
      ref={meshRef}
      object={clonedScene}
      scale={2.5}
      position={[0, -0.5, 0]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onPartClick("heart");
      }}
    />
  );
}

// Preload the model
useGLTF.preload("/sliced_organs/heart.glb");

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
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: isSelected ? "#f39c12" : part.color,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            border: "3px solid white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            transition: "all 0.3s ease",
            transform: isSelected ? "scale(1.2)" : "scale(1)",
          }}
        >
          {part.id}
        </div>
        {/* Part name label */}
        <div
          style={{
            position: "absolute",
            left: "35px",
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            whiteSpace: "nowrap",
            opacity: isSelected ? 1 : 0.7,
            transition: "opacity 0.3s ease",
          }}
        >
          {part.name}
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
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <directionalLight position={[-10, -10, -5]} intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />

      <Suspense 
        fallback={
          <Html>
            <div style={{ color: "white", fontSize: "18px" }}>
              Loading Sliced Heart Model...
            </div>
          </Html>
        }
      >
        <SlicedHeartModel onPartClick={handlePartClick} />

        {heartParts.map((part) => (
          <PartLabel
            key={part.id}
            part={part}
            isSelected={selectedPart === part.id}
            onClick={() => handlePartClick(part.id)}
          />
        ))}
      </Suspense>      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={12}
        autoRotate={false}
        autoRotateSpeed={0.5}
        target={[0, 0, 0]}
        enableDamping={true}
        dampingFactor={0.05}
        screenSpacePanning={false}
        maxPolarAngle={Math.PI}
        ref={(controls) => {
          if (controls) {
            // Reset to default position when controls are created
            controls.reset();
          }
        }}
      />

      {selectedPartData && (
        <Html
          position={[0, 2.5, 0]}
          style={{
            pointerEvents: "none",
            userSelect: "none",
            width: "400px",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(44, 62, 80, 0.95)",
              color: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              backdropFilter: "blur(15px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: selectedPartData.color,
                  marginRight: "10px",
                  border: "2px solid white",
                }}
              />
              <h3 style={{ margin: 0, color: "#f39c12", fontSize: "18px" }}>
                {selectedPartData.name}
              </h3>
            </div>
            <p style={{ margin: "0 0 12px 0", fontSize: "14px", lineHeight: "1.5", color: "#ecf0f1" }}>
              {selectedPartData.description}
            </p>
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.2)",
                paddingTop: "12px",
              }}
            >
              <h4 style={{ margin: "0 0 8px 0", color: "#3498db", fontSize: "14px" }}>
                Detailed Information:
              </h4>
              <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.4", color: "#bdc3c7" }}>
                {selectedPartData.detailedInfo}
              </p>
            </div>
          </div>
        </Html>
      )}
    </>
  );
}

const SlicedHeartPage: React.FC = () => {
  const navigate = useNavigate();

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      // Clean up any lingering Three.js resources
      console.log("Cleaning up SlicedHeartPage resources");
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      }}
    >
      {/* Header Controls */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          right: "20px",
          zIndex: 1000,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            backgroundColor: "rgba(231, 76, 60, 0.9)",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(231, 76, 60, 1)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(231, 76, 60, 0.9)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          ← Back to AR Scanner
        </button>
        
        <div
          style={{
            backgroundColor: "rgba(44, 62, 80, 0.9)",
            color: "white",
            padding: "12px 20px",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          Interactive Sliced Heart Anatomy
        </div>
      </div>

      {/* Instructions */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "15px",
          borderRadius: "8px",
          fontSize: "14px",
          maxWidth: "300px",
          zIndex: 1000,
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
          🖱️ Controls:
        </div>
        <div>• Click numbered labels to view part details</div>
        <div>• Drag to rotate • Scroll to zoom</div>
        <div>• Right-click drag to pan</div>
      </div>      <Canvas
        camera={{ 
          position: [0, 0, 8], 
          fov: 45,
          near: 0.1,
          far: 1000 
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
        onCreated={({ gl, camera, scene }) => {
          console.log("Canvas created successfully");
          console.log("Camera position:", camera.position);
          console.log("Scene:", scene);
          
          // Ensure proper camera setup
          camera.position.set(0, 0, 8);
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
          
          // Configure renderer
          gl.setClearColor(0x000000, 0);
          gl.setSize(window.innerWidth, window.innerHeight);
        }}
        gl={{ 
          antialias: true, 
          alpha: true,
          preserveDrawingBuffer: true 
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default SlicedHeartPage;
