import React from "react";
import { Box, Text } from "@react-three/drei";
import { makeKeycapGeo, U, GAP, KEY_H } from "./keycapGeo";

// ── 键盘主体尺寸 ──────────────────────────────────────────────────────────────
const KBD_W = 0.65;
const KBD_H = 0.022;
const KBD_D = 0.22;

// ── 键帽 Y 轴基准：键帽底面贴紧按键底板顶面 ─────────────────────────────────
// 按键底板顶面 = KBD_H + 0.003（底板厚 0.003，中心在 KBD_H + 0.0015）
const PANEL_TOP = KBD_H + 0.003;
const KEY_Y     = PANEL_TOP + 0.0005; // 留 0.5 mm 间隙
const KEY_TOP   = KEY_Y + KEY_H + 0.0002; // 标签文字贴在键帽顶面

// ── 布局常量（与 keycapGeo 共享同一 U / GAP） ─────────────────────────────────
const MX = 0.04;
const MZ = 0.015;

const X0 = -KBD_W / 2 + MX;
const Z0 = -KBD_D / 2 + MZ + U / 2;

// ── 颜色 ──────────────────────────────────────────────────────────────────────
const C_KEY   = "#2c2c2c";
const C_BLUE  = "#1a73e8";
const C_GOLD  = "#e6b800";
const C_LABEL = "#aaaaaa"; // 标签字体颜色

// ── Key 组件：使用真实键帽几何体 + 文字标签 ──────────────────────────────────
interface KeyProps {
  cx: number;
  cz: number;
  wu?: number;
  color?: string;
  label?: string;
}

function labelFontSize(label: string): number {
  if (label.length === 1) return 0.010;
  if (label.length <= 3)  return 0.007;
  return 0.006;
}

const Key: React.FC<KeyProps> = ({ cx, cz, wu = 1, color = C_KEY, label }) => (
  <group position={[cx, 0, cz]}>
    <mesh
      geometry={makeKeycapGeo(wu * U - GAP, U - GAP)}
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

// ── 行生成器 ──────────────────────────────────────────────────────────────────
// [宽度u, 颜色?, 标签?]
type KeyDef = [number, (string | undefined)?, string?];

function buildRow(row: number, defs: KeyDef[]): React.ReactElement[] {
  const cz = Z0 + row * U;
  let x = X0;
  return defs.map(([wu, color, label], i) => {
    const cx = x + (wu * U) / 2;
    x += wu * U;
    return <Key key={i} cx={cx} cz={cz} wu={wu} color={color} label={label} />;
  });
}

// ── 左移 64 配列布局 ──────────────────────────────────────────────────────────
// 行0：数字行（13×1u + 2u 退格）
const ROW0: KeyDef[] = [
  [1, undefined, '`'],  [1, undefined, '1'],  [1, undefined, '2'],
  [1, undefined, '3'],  [1, undefined, '4'],  [1, undefined, '5'],
  [1, undefined, '6'],  [1, undefined, '7'],  [1, undefined, '8'],
  [1, undefined, '9'],  [1, undefined, '0'],  [1, undefined, '-'],
  [1, undefined, '='],  [2, undefined, '⌫'],
];
// 行1：QWERTY 行（1.5u Tab + 12×1u + 1.5u 反斜杠）
const ROW1: KeyDef[] = [
  [1.5, undefined, 'Tab'], [1, undefined, 'Q'], [1, undefined, 'W'],
  [1, undefined, 'E'],     [1, undefined, 'R'], [1, undefined, 'T'],
  [1, undefined, 'Y'],     [1, undefined, 'U'], [1, undefined, 'I'],
  [1, undefined, 'O'],     [1, undefined, 'P'], [1, undefined, '['],
  [1, undefined, ']'],     [1.5, undefined, '\\'],
];
// 行2：ASDF 行（1.75u Caps + 11×1u + 2.25u Enter）
const ROW2: KeyDef[] = [
  [1.75, undefined, 'Caps'], [1, undefined, 'A'], [1, undefined, 'S'],
  [1, undefined, 'D'],       [1, undefined, 'F'], [1, undefined, 'G'],
  [1, undefined, 'H'],       [1, undefined, 'J'], [1, undefined, 'K'],
  [1, undefined, 'L'],       [1, undefined, ';'], [1, undefined, "'"],
  [2.25, undefined, '↵'],
];
// 行3：ZXCV 行（2u 左 Shift + 10 字母键 + ⇧ + ↑ + Del）
// "左移"特征：左 Shift 为 2u，右侧无传统 RShift，改为导航辅助键
const ROW3: KeyDef[] = [
  [2, undefined, 'Shift'], [1, undefined, 'Z'], [1, undefined, 'X'],
  [1, undefined, 'C'],     [1, undefined, 'V'], [1, undefined, 'B'],
  [1, undefined, 'N'],     [1, undefined, 'M'], [1, undefined, ','],
  [1, undefined, '.'],     [1, undefined, '/'], [1, undefined, '⇧'],
  [1, undefined, '↑'],     [1, undefined, 'Del'],
];
// 行4：修饰键行（←↓→ 与 ROW3 末三键纵向对齐，构成倒 T 形方向键簇）
const ROW4: KeyDef[] = [
  [1.25, undefined, 'Ctrl'], [1.25, undefined, 'Win'], [1.25, undefined, 'Alt'],
  [6.25, undefined, ''],
  [1, C_BLUE, 'Fn'],  [1, C_GOLD, 'App'],
  [1, undefined, '←'], [1, undefined, '↓'], [1, undefined, '→'],
];

// ── 主组件 ────────────────────────────────────────────────────────────────────
const KeyboardModel: React.FC = () => (
  <group>
    {/* 键盘主体 */}
    <Box
      args={[KBD_W, KBD_H, KBD_D]}
      position={[0, KBD_H / 2, 0]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color="#181818" roughness={0.85} metalness={0.05} />
    </Box>

    {/* 按键底板 */}
    <Box
      args={[KBD_W - 0.016, 0.003, KBD_D - 0.016]}
      position={[0, KBD_H + 0.0015, 0]}
    >
      <meshStandardMaterial color="#202020" roughness={0.9} metalness={0.03} />
    </Box>

    {buildRow(0, ROW0)}
    {buildRow(1, ROW1)}
    {buildRow(2, ROW2)}
    {buildRow(3, ROW3)}
    {buildRow(4, ROW4)}
  </group>
);

export default KeyboardModel;
