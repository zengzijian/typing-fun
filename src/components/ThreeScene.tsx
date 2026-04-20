import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import TableModel from "./models/TableModel";
import ChairModel from "./models/ChairModel";
import MonitorModel from "./models/MonitorModel";
import KeyboardModel from "./models/KeyboardModel";
import MouseModel from "./models/MouseModel";

// 场景尺寸常量
const TABLE_TOP_H = 0.12;
const LEG_H = 1.2;
const FLOOR_Y = -TABLE_TOP_H / 2 - LEG_H - 0.01; // -1.27
const DESK_Y  = TABLE_TOP_H / 2;                  //  0.06
const CHAIR_Z = 1.5;

const ThreeScene: React.FC = () => (
  <div style={{ width: "100%", height: "100%" }}>
    <Canvas
      shadows
      camera={{ position: [4, 3, 5], fov: 50 }}
      style={{ background: "linear-gradient(to bottom, #1a1a2e, #16213e)" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[6, 8, 4]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <pointLight position={[-4, 4, -4]} intensity={0.3} color="#a0c4ff" />

      {/* 桌子：TableModel 的 y=0 贴地板 */}
      <group position={[0, FLOOR_Y, 0]}>
        <TableModel />
      </group>

      {/* 椅子：放置在桌前，z=CHAIR_Z 为椅子中心 */}
      <group position={[0, FLOOR_Y, CHAIR_Z]}>
        <ChairModel />
      </group>

      {/* 桌面物品：各模型 y=0 对应桌面 DESK_Y */}
      <group position={[0, DESK_Y, -0.38]}>
        <MonitorModel />
      </group>
      <group position={[0, DESK_Y, 0.2]}>
        <KeyboardModel />
      </group>
      <group position={[0.44, DESK_Y, 0.18]}>
        <MouseModel />
      </group>

      {/* 地板 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2a2a3a" roughness={1} />
      </mesh>

      <gridHelper args={[10, 20, "#3a3a5a", "#2e2e4a"]} position={[0, FLOOR_Y, 0]} />

      <OrbitControls
        target={[0, -0.4, 0]}
        enablePan
        enableZoom
        enableRotate
        minDistance={2}
        maxDistance={15}
      />
    </Canvas>
  </div>
);

export default ThreeScene;
