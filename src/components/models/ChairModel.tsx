import React from "react";
import { Box } from "@react-three/drei";

// 局部坐标：y=0 为椅腿底部，z=0 为椅子前后中心
const SEAT_W = 0.7, SEAT_D = 0.65, SEAT_H = 0.08;
const C_LEG_W = 0.06, C_LEG_H = 0.78;
const BACK_H = 0.6;
const BACK_POST_TOTAL = C_LEG_H + BACK_H; // 1.38

const SEAT_Y      = C_LEG_H + SEAT_H / 2;                  // 0.82
const C_LEG_Y     = C_LEG_H / 2;                           // 0.39
const C_LEG_X     = SEAT_W / 2 - C_LEG_W / 2;             // 0.32
const C_FRONT_Z   = -(SEAT_D / 2 - C_LEG_W / 2);          // -0.295
const C_BACK_Z    =   SEAT_D / 2 - C_LEG_W / 2;           //  0.295
const BACK_POST_Y = BACK_POST_TOTAL / 2;                    // 0.69

const RAIL_T    = 0.06;
const RAIL_W    = SEAT_W - C_LEG_W;                        // 0.64
const TOP_RAIL_Y = BACK_POST_TOTAL - RAIL_T / 2;           // 1.35
const MID_RAIL_Y = C_LEG_H + SEAT_H + BACK_H * 0.35;      // 1.07

const ChairModel: React.FC = () => {
  const wood = <meshStandardMaterial color="#8B6914" roughness={0.75} metalness={0.05} />;
  const dark = <meshStandardMaterial color="#6B4F12" roughness={0.85} metalness={0.05} />;

  return (
    <group>
      {/* 椅面 */}
      <Box args={[SEAT_W, SEAT_H, SEAT_D]} position={[0, SEAT_Y, 0]} castShadow receiveShadow>
        {wood}
      </Box>

      {/* 前腿 */}
      {([-C_LEG_X, C_LEG_X] as number[]).map((x, i) => (
        <Box key={`fl${i}`} args={[C_LEG_W, C_LEG_H, C_LEG_W]} position={[x, C_LEG_Y, C_FRONT_Z]} castShadow receiveShadow>
          {dark}
        </Box>
      ))}

      {/* 后立柱（腿 + 靠背一体） */}
      {([-C_LEG_X, C_LEG_X] as number[]).map((x, i) => (
        <Box key={`bp${i}`} args={[C_LEG_W, BACK_POST_TOTAL, C_LEG_W]} position={[x, BACK_POST_Y, C_BACK_Z]} castShadow receiveShadow>
          {dark}
        </Box>
      ))}

      {/* 靠背顶部横梁 */}
      <Box args={[RAIL_W, RAIL_T, RAIL_T]} position={[0, TOP_RAIL_Y, C_BACK_Z]} castShadow receiveShadow>
        {dark}
      </Box>

      {/* 靠背中部横梁 */}
      <Box args={[RAIL_W, RAIL_T, RAIL_T]} position={[0, MID_RAIL_Y, C_BACK_Z]} castShadow receiveShadow>
        {dark}
      </Box>
    </group>
  );
};

export default ChairModel;
