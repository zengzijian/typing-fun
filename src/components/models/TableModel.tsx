import React from "react";
import { Box } from "@react-three/drei";

// 局部坐标：y=0 为桌腿底部，桌面顶部 y ≈ 1.32
const TOP_W = 3, TOP_H = 0.12, TOP_D = 1.5;
const LEG_W = 0.1, LEG_H = 1.2, LEG_D = 0.1;
const LEG_X = TOP_W / 2 - 0.15;
const LEG_Z = TOP_D / 2 - 0.12;
const TOP_Y = LEG_H + TOP_H / 2;
const LEG_Y = LEG_H / 2;

const LEG_POS: [number, number, number][] = [
  [-LEG_X, LEG_Y, -LEG_Z],
  [-LEG_X, LEG_Y,  LEG_Z],
  [ LEG_X, LEG_Y, -LEG_Z],
  [ LEG_X, LEG_Y,  LEG_Z],
];

const TableModel: React.FC = () => (
  <group>
    <Box args={[TOP_W, TOP_H, TOP_D]} position={[0, TOP_Y, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#8B6914" roughness={0.75} metalness={0.05} />
    </Box>
    {LEG_POS.map((pos, i) => (
      <Box key={i} args={[LEG_W, LEG_H, LEG_D]} position={pos} castShadow receiveShadow>
        <meshStandardMaterial color="#6B4F12" roughness={0.85} metalness={0.05} />
      </Box>
    ))}
  </group>
);

export default TableModel;
