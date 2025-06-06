import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, Center } from "@react-three/drei";
import * as THREE from "three";

// Pre-load the model outside the component to avoid re-fetching
let loadStarted = false;
try {
  useGLTF.preload("/kidney/scene.gltf");
  loadStarted = true;
} catch (e) {
  console.error("Failed to preload kidney model:", e);
}

function KidneyModelInner() {
  const { scene } = useGLTF("/kidney/scene.gltf");
  const modelRef = useRef<THREE.Group>(null);

  // Optimize the scene when it loads
  useEffect(() => {
    if (scene) {
      // Lower quality settings for better performance
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          // Simplify materials
          if (mesh.material) {
            (mesh.material as THREE.Material).precision = "lowp";
          }
        }
      });
    }
  }, [scene]);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.005; // Gentle rotation
    }
  });

  return (
    <Center>
      <primitive
        ref={modelRef}
        object={scene}
        scale={8} // Increased scale for better visibility
        position={[0, 0, 0]}
      />
    </Center>
  );
}

interface KidneyViewerProps {
  width?: string;
  height?: string;
  className?: string;
}

const KidneyViewer: React.FC<KidneyViewerProps> = ({
  width = "100%",
  height = "150px",
  className,
}) => {
  const [loaded, setLoaded] = useState(loadStarted);
  const [error, setError] = useState(false);

  // Faster timeout - fail quicker to show fallback
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!loaded) {
        setError(true);
      }
    }, 2000); // Reduced to 2 seconds

    return () => clearTimeout(timeout);
  }, [loaded]);

  // If already errored, just show the fallback
  if (error) {
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
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        className={className}
      >
        <img
          src="/kidney.png"
          alt="Kidney"
          style={{
            maxHeight: "100%",
            maxWidth: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    );
  }

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
      <Canvas
        camera={{ position: [0, 0, 200], fov: 40 }}
        onCreated={() => setLoaded(true)}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
        dpr={[0.8, 1.5]} // Lower resolution for better performance
        performance={{ min: 0.1 }} // More aggressive performance settings
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <React.Suspense fallback={null}>
          <KidneyModelInner />
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
    </div>
  );
};

export default KidneyViewer;
