import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, Center } from "@react-three/drei";
import * as THREE from "three";

function LungsModelInner() {
  const { scene } = useGLTF("/lungs/scene.gltf");
  const modelRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.005; // Only horizontal rotation
    }
  });

  return (
    <Center>
      <primitive
        ref={modelRef}
        object={scene}
        scale={2} // Keeping your current scale
        position={[0, 0, 0]} // Centered position
      />
    </Center>
  );
}

interface LungsViewerProps {
  width?: string;
  height?: string;
  className?: string;
}

const LungsViewer: React.FC<LungsViewerProps> = ({
  width = "100%",
  height = "150px", // Reduced height to leave room for choices
  className,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Check if model loads
  useEffect(() => {
    // Try to load the model
    const timeout = setTimeout(() => {
      if (!loaded) {
        setError(true);
      }
    }, 500); // Give 3 seconds to load

    return () => clearTimeout(timeout);
  }, [loaded]);

  return (
    <div
      style={{
        width,
        height,
        overflow: "hidden",
        position: "relative",
        margin: "0 auto",
        padding: 0,
        boxSizing: "border-box",
        borderRadius: "8px",
        backgroundColor: "rgba(255,255,255,0.05)",
      }}
      className={className}
    >
      {error ? (
        // Fallback image if 3D model fails to load
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src="/lungs.png"
            alt="Lungs"
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      ) : (
        <Canvas
          camera={{ position: [0, 1, 1.3], fov: 35 }}
          onCreated={() => setLoaded(true)}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
          }}
        >
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 5, 5]} intensity={2} />
          <directionalLight
            position={[-5, -5, -5]}
            intensity={1}
            color="#ffffff"
          />
          <React.Suspense fallback={null}>
            <LungsModelInner />
            <Environment preset="studio" />
            <OrbitControls
              enableZoom={false}
              autoRotate={false}
              enablePan={false}
              minPolarAngle={Math.PI / 2 - 0.3}
              maxPolarAngle={Math.PI / 2 + 0.3}
            />
          </React.Suspense>
        </Canvas>
      )}
    </div>
  );
};

// Safer preloading with error handling - fixed path to match the path used above
try {
  useGLTF.preload("/lungs/scene.gltf");
} catch (e) {
  console.error("Failed to preload lungs model:", e);
}

export default LungsViewer;
