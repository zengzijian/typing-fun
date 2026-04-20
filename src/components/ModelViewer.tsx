import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Bounds } from "@react-three/drei";

interface ModelViewerProps {
  children: React.ReactNode;
  autoRotate?: boolean;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ children, autoRotate = true }) => (
  <div style={{ width: "100%", height: "100%" }}>
    <Canvas
      shadows
      camera={{ position: [3, 2, 3], fov: 50 }}
      style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow />
      <pointLight position={[-4, 4, -4]} intensity={0.25} color="#a0c4ff" />

      <Bounds fit clip observe margin={1.4}>
        {children}
      </Bounds>

      <OrbitControls
        makeDefault
        autoRotate={autoRotate}
        autoRotateSpeed={1.8}
        enablePan={false}
        minDistance={0.5}
        maxDistance={30}
      />
    </Canvas>
  </div>
);

export default ModelViewer;
