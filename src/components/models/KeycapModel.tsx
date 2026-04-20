import React from "react";
import { makeKeycapGeo, U, type RowProfile } from "./keycapGeo";

interface KeycapModelProps {
  wu?: number;
  row?: RowProfile;
  color?: string;
}

const KeycapModel: React.FC<KeycapModelProps> = ({
  wu = 1,
  row = 3,
  color = "#f0f0f0",
}) => (
  <mesh geometry={makeKeycapGeo(wu * U, U, row)} castShadow>
    <meshStandardMaterial color={color} roughness={0.28} metalness={0.08} />
  </mesh>
);

export default KeycapModel;
