import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

interface ModelProps {
  modelPath: string;
}

function Model({ modelPath }: ModelProps) {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene} />;
}

export function ModelViewer({ modelPath }: ModelProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "400px",
        background: "#222",
        borderRadius: 8,
      }}
    >
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 2, 2]} intensity={0.7} />
        <Suspense fallback={null}>
          <Model modelPath={modelPath} />
        </Suspense>
        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  );
}
