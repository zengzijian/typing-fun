import React from "react";
import { Box } from "@react-three/drei";

// 局部坐标：y=0 为底座底部（放置在桌面），z=0 为屏幕中心
const BASE_H = 0.025, NECK_H = 0.13;
const BEZ_W = 0.85, BEZ_H = 0.5, BEZ_D = 0.04;

const BASE_Y = BASE_H / 2;
const NECK_Y = BASE_H + NECK_H / 2;
const BEZ_Y  = BASE_H + NECK_H + BEZ_H / 2;
const SCR_Z  = BEZ_D / 2 + 0.003; // 屏幕贴在边框正面

const MonitorModel: React.FC = () => (
  <group>
    {/* 底座 */}
    <Box args={[0.28, BASE_H, 0.16]} position={[0, BASE_Y, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.6} />
    </Box>

    {/* 支架颈部 */}
    <Box args={[0.045, NECK_H, 0.045]} position={[0, NECK_Y, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.6} />
    </Box>

    {/* 屏幕边框 */}
    <Box args={[BEZ_W, BEZ_H, BEZ_D]} position={[0, BEZ_Y, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#111111" roughness={0.5} metalness={0.3} />
    </Box>

    {/* 屏幕面板（蓝色发光） */}
    <Box args={[BEZ_W - 0.06, BEZ_H - 0.08, 0.008]} position={[0, BEZ_Y, SCR_Z]}>
      <meshStandardMaterial color="#1a3a5c" roughness={0.05} emissive="#3a7ab5" emissiveIntensity={0.5} />
    </Box>
  </group>
);

export default MonitorModel;
