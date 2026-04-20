import React from "react";
import { Box } from "@react-three/drei";

// 局部坐标：y=0 为鼠标底部，x/z 居中
const MSE_W = 0.09, MSE_H = 0.038, MSE_D = 0.13;
const MSE_Y = MSE_H / 2;

const MouseModel: React.FC = () => (
  <group>
    {/* 鼠标主体 */}
    <Box args={[MSE_W, MSE_H, MSE_D]} position={[0, MSE_Y, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.2} />
    </Box>

    {/* 左右键分割线 */}
    <Box args={[0.003, 0.005, MSE_D * 0.54]} position={[0, MSE_H + 0.002, -MSE_D * 0.08]}>
      <meshStandardMaterial color="#0a0a0a" roughness={1} />
    </Box>

    {/* 滚轮 */}
    <Box args={[0.02, 0.01, 0.025]} position={[0, MSE_H + 0.005, -MSE_D * 0.1]}>
      <meshStandardMaterial color="#444444" roughness={0.7} />
    </Box>
  </group>
);

export default MouseModel;
