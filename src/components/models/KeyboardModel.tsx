import React from "react";
import { Box, Text } from "@react-three/drei";
import { makeKeycapGeo, U, GAP, KEY_H, type RowProfile } from "./keycapGeo";

const KBD_W = 0.65;
const KBD_H = 0.022;
const KBD_D = 0.22;

const PANEL_TOP = KBD_H + 0.003;
const KEY_Y     = PANEL_TOP + 0.0005;
const KEY_TOP   = KEY_Y + KEY_H + 0.0002;

const MX = 0.04;
const MZ = 0.015;

const X0 = -KBD_W / 2 + MX;
const Z0 = -KBD_D / 2 + MZ + U / 2;

const C_KEY   = "#2c2c2c";
const C_BLUE  = "#1a73e8";
const C_GOLD  = "#e6b800";
const C_LABEL = "#aaaaaa";

interface KeyProps {
  cx: number;
  cz: number;
  wu?: number;
  row?: RowProfile;
  color?: string;
  label?: string;
}

function labelFontSize(label: string): number {
  if (label.length === 1) return 0.010;
  if (label.length <= 3)  return 0.007;
  return 0.006;
}

const Key: React.FC<KeyProps> = ({ cx, cz, wu = 1, row = 3, color = C_KEY, label }) => (
  <group position={[cx, 0, cz]}>
    <mesh
      geometry={makeKeycapGeo(wu * U - GAP, U - GAP, row)}
      position={[0, KEY_Y, 0]}
      castShadow
    >
      <meshStandardMaterial color={color} roughness={0.38} metalness={0.1} />
    </mesh>
    {label && (
      <Text
        position={[0, KEY_TOP, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={labelFontSize(label)}
        color={C_LABEL}
        anchorX="center"
        anchorY="middle"
        maxWidth={wu * U - GAP - 0.003}
      >
        {label}
      </Text>
    )}
  </group>
);

type KeyDef = [number, (string | undefined)?, string?];

function buildRow(rowIdx: number, row: RowProfile, defs: KeyDef[]): React.ReactElement[] {
  const cz = Z0 + rowIdx * U;
  let x = X0;
  return defs.map(([wu, color, label], i) => {
    const cx = x + (wu * U) / 2;
    x += wu * U;
    return <Key key={i} cx={cx} cz={cz} wu={wu} row={row} color={color} label={label} />;
  });
}

const ROW0: KeyDef[] = [
  [1, undefined, '`'],  [1, undefined, '1'],  [1, undefined, '2'],
  [1, undefined, '3'],  [1, undefined, '4'],  [1, undefined, '5'],
  [1, undefined, '6'],  [1, undefined, '7'],  [1, undefined, '8'],
  [1, undefined, '9'],  [1, undefined, '0'],  [1, undefined, '-'],
  [1, undefined, '='],  [2, undefined, '⌫'],
];
const ROW1: KeyDef[] = [
  [1.5, undefined, 'Tab'], [1, undefined, 'Q'], [1, undefined, 'W'],
  [1, undefined, 'E'],     [1, undefined, 'R'], [1, undefined, 'T'],
  [1, undefined, 'Y'],     [1, undefined, 'U'], [1, undefined, 'I'],
  [1, undefined, 'O'],     [1, undefined, 'P'], [1, undefined, '['],
  [1, undefined, ']'],     [1.5, undefined, '\\'],
];
const ROW2: KeyDef[] = [
  [1.75, undefined, 'Caps'], [1, undefined, 'A'], [1, undefined, 'S'],
  [1, undefined, 'D'],       [1, undefined, 'F'], [1, undefined, 'G'],
  [1, undefined, 'H'],       [1, undefined, 'J'], [1, undefined, 'K'],
  [1, undefined, 'L'],       [1, undefined, ';'], [1, undefined, "'"],
  [2.25, undefined, '↵'],
];
const ROW3: KeyDef[] = [
  [2, undefined, 'Shift'], [1, undefined, 'Z'], [1, undefined, 'X'],
  [1, undefined, 'C'],     [1, undefined, 'V'], [1, undefined, 'B'],
  [1, undefined, 'N'],     [1, undefined, 'M'], [1, undefined, ','],
  [1, undefined, '.'],     [1, undefined, '/'], [1, undefined, '⇧'],
  [1, undefined, '↑'],     [1, undefined, 'Del'],
];
const ROW4: KeyDef[] = [
  [1.25, undefined, 'Ctrl'], [1.25, undefined, 'Win'], [1.25, undefined, 'Alt'],
  [6.25, undefined, ''],
  [1, C_BLUE, 'Fn'],  [1, C_GOLD, 'App'],
  [1, undefined, '←'], [1, undefined, '↓'], [1, undefined, '→'],
];

const KeyboardModel: React.FC = () => (
  <group>
    <Box
      args={[KBD_W, KBD_H, KBD_D]}
      position={[0, KBD_H / 2, 0]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color="#181818" roughness={0.85} metalness={0.05} />
    </Box>

    <Box
      args={[KBD_W - 0.016, 0.003, KBD_D - 0.016]}
      position={[0, KBD_H + 0.0015, 0]}
    >
      <meshStandardMaterial color="#202020" roughness={0.9} metalness={0.03} />
    </Box>

    {buildRow(0, 1, ROW0)}
    {buildRow(1, 2, ROW1)}
    {buildRow(2, 3, ROW2)}
    {buildRow(3, 4, ROW3)}
    {buildRow(4, 4, ROW4)}
  </group>
);

export default KeyboardModel;
