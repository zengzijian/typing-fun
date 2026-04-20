import React from "react";
import { makeKeycapGeo, U } from "./keycapGeo";

interface KeycapModelProps {
  wu?: number;   // 宽度（单位 u）
  color?: string;
}

const KeycapModel: React.FC<KeycapModelProps> = ({
  wu = 1,
  color = "#f0f0f0",
}) => (
  // 模型库独立展示：使用完整 1u 深度，不减去按键间隙
  <mesh geometry={makeKeycapGeo(wu * U, U)} castShadow>
    <meshStandardMaterial color={color} roughness={0.28} metalness={0.08} />
  </mesh>
);

export default KeycapModel;
