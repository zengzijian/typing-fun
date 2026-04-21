/**
 * OEM-profile keycap geometry — values from rsheldiii/KeyV2 oem.scad.
 *
 * tiltDeg convention (mirrors KeyV2 $top_tilt):
 *   positive = front edge lower (key face toward typist)
 *   negative = front edge higher (key face slightly away)
 *
 *   R1 (Row 0, number row): 11.2mm, −3° (nearly flat, slight backward lean)
 *   R2 (Row 1, QWERTY):     9.45mm, +1° (barely forward)
 *   R3 (Row 2, home):       9.0mm,  +6° (moderate forward lean)
 *   R4 (Row 3, ZXCV/mod):  9.25mm,  +9° (strong forward lean, faces typist)
 *
 * Bottom: 18.05×18.05mm, Top: 12.25×14.05mm (1u real-scale)
 * Width taper is absolute (fixed per side) so wide keys stay proportional.
 * Project uses 2× scale (U=38mm ≈ 2×19.05mm).
 */

import * as THREE from "three";

export const U   = 0.038;
export const GAP = 0.003;

export type RowProfile = 1 | 2 | 3 | 4;

interface ProfileSpec {
  height: number;
  tiltDeg: number;
  topW: number;
  topD: number;
  dish: number;
}

const PROFILES: Record<RowProfile, ProfileSpec> = {
  1: { height: 0.0224, tiltDeg: -3, topW: 0.68, topD: 0.78, dish: 0.002 },
  2: { height: 0.0189, tiltDeg:  1, topW: 0.68, topD: 0.78, dish: 0.002 },
  3: { height: 0.0180, tiltDeg:  6, topW: 0.68, topD: 0.78, dish: 0.002 },
  4: { height: 0.0185, tiltDeg:  9, topW: 0.68, topD: 0.78, dish: 0.002 },
};

export const KEY_H = PROFILES[3].height;

const R_BOT  = 0.001;
const R_TOP  = 0.0025;
const RING_N = 40;
const V_SEGS = 8;

const geoCache = new Map<string, THREE.BufferGeometry>();

function rrPts(hw: number, hd: number, r: number): [number, number][] {
  r = Math.min(r, hw - 1e-4, hd - 1e-4);
  if (r < 1e-4) r = 1e-4;

  const sW   = 2 * (hw - r);
  const sD   = 2 * (hd - r);
  const qArc = (Math.PI / 2) * r;
  const peri = 2 * sW + 2 * sD + 4 * qArc;
  const pts: [number, number][] = [];

  for (let i = 0; i < RING_N; i++) {
    let d = (i / RING_N) * peri;
    let x: number, z: number;

    if (d < sW) {
      x = -(hw - r) + d;
      z = -hd;
    } else if ((d -= sW) < qArc) {
      const a = -Math.PI / 2 + (d / qArc) * (Math.PI / 2);
      x = (hw - r) + r * Math.cos(a);
      z = -(hd - r) + r * Math.sin(a);
    } else if ((d -= qArc) < sD) {
      x = hw;
      z = -(hd - r) + d;
    } else if ((d -= sD) < qArc) {
      const a = (d / qArc) * (Math.PI / 2);
      x = (hw - r) + r * Math.cos(a);
      z = (hd - r) + r * Math.sin(a);
    } else if ((d -= qArc) < sW) {
      x = (hw - r) - d;
      z = hd;
    } else if ((d -= sW) < qArc) {
      const a = Math.PI / 2 + (d / qArc) * (Math.PI / 2);
      x = -(hw - r) + r * Math.cos(a);
      z = (hd - r) + r * Math.sin(a);
    } else if ((d -= qArc) < sD) {
      x = -hw;
      z = (hd - r) - d;
    } else {
      d -= sD;
      const a = Math.PI + (Math.min(d, qArc) / qArc) * (Math.PI / 2);
      x = -(hw - r) + r * Math.cos(a);
      z = -(hd - r) + r * Math.sin(a);
    }

    pts.push([x, z]);
  }
  return pts;
}

export function makeKeycapGeo(
  w: number,
  d: number,
  row: RowProfile = 3,
): THREE.BufferGeometry {
  const k = `${w.toFixed(5)}_${d.toFixed(5)}_${row}`;
  if (geoCache.has(k)) return geoCache.get(k)!;

  const prof = PROFILES[row];
  const H    = prof.height;
  const tilt = (prof.tiltDeg * Math.PI) / 180;

  const hw  = w / 2;
  const hd  = d / 2;
  // Use fixed absolute taper (= 1U key taper) so wide keys don't over-narrow
  const thw = hw - (U / 2) * (1 - prof.topW);
  const thd = hd * prof.topD;

  const pos: number[] = [];
  const idx: number[] = [];

  // ── Side wall rings (linear — keeps sides as flat planes) ───────────
  for (let lv = 0; lv <= V_SEGS; lv++) {
    const t = lv / V_SEGS;
    const y = t * H;
    for (const [x, z] of rrPts(
      hw + (thw - hw) * t,
      hd + (thd - hd) * t,
      R_BOT + (R_TOP - R_BOT) * t,
    )) {
      const dy = -Math.sin(tilt) * z * t;
      const dz =  z * (Math.cos(tilt) - 1) * t;
      pos.push(x, y + dy, z + dz);
    }
  }

  for (let lv = 0; lv < V_SEGS; lv++) {
    const a = lv * RING_N;
    const b = (lv + 1) * RING_N;
    for (let i = 0; i < RING_N; i++) {
      const j = (i + 1) % RING_N;
      idx.push(a + i, b + i, b + j);
      idx.push(a + i, b + j, a + j);
    }
  }

  // ── Bottom face ───────────────────────────────────────────────────
  const bc = pos.length / 3;
  pos.push(0, 0, 0);
  for (let i = 0; i < RING_N; i++) {
    idx.push(bc, i, (i + 1) % RING_N);
  }

  // ── Top face with cylindrical dish ────────────────────────────────
  // Cylindrical: dish depth varies along Z (front-back), constant along X
  const topRing = V_SEGS * RING_N;
  const innerBases: number[] = [];
  const scales = [0.65, 0.35, 0.1];
  const DISH = prof.dish;

  for (const s of scales) {
    const base = pos.length / 3;
    innerBases.push(base);
    for (const [x, z] of rrPts(thw * s, thd * s, R_TOP * s)) {
      const nz = thd > 1e-6 ? z / thd : 0;
      const cylDepth = DISH * (1 - s * s) * (1 - nz * nz * 0.3);
      const yBase = H - cylDepth;
      const dy = -Math.sin(tilt) * z;
      const dz =  z * (Math.cos(tilt) - 1);
      pos.push(x, yBase + dy, z + dz);
    }
  }

  const tc = pos.length / 3;
  {
    const yBase = H - DISH;
    pos.push(0, yBase, 0);
  }

  let outer = topRing;
  for (const inner of innerBases) {
    for (let i = 0; i < RING_N; i++) {
      const j = (i + 1) % RING_N;
      idx.push(outer + i, inner + i, inner + j);
      idx.push(outer + i, inner + j, outer + j);
    }
    outer = inner;
  }

  const last = innerBases[innerBases.length - 1];
  for (let i = 0; i < RING_N; i++) {
    idx.push(tc, last + (i + 1) % RING_N, last + i);
  }

  // ── Finalize ──────────────────────────────────────────────────────
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();

  geoCache.set(k, geo);
  return geo;
}
