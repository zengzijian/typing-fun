/**
 * OEM-profile keycap geometry — based on technical drawing:
 *   Bottom 18×18mm, α=80° (side), β=70° (front), HB=9.4mm, HF=9.68mm, s=R30
 *
 * Project uses 2× scale (U=38mm ≈ 2×19.05mm), so all mm values are doubled.
 * Geometry: lofted rounded-rectangle rings with cubic ease (R30 top edge).
 */

import * as THREE from "three";

export const U     = 0.038;
export const GAP   = 0.003;
export const KEY_H = 0.020;   // 9.5mm real × 2.11

// α=80° → side inset = H/tan80° → top_w ratio ≈ 0.81
// β=70° → front inset = H/tan70° → top_d ratio ≈ 0.72
const TOP_W = 0.81;
const TOP_D = 0.72;
const DISH   = 0.0015;  // R30 dish sagitta at 2× scale
const R_BOT  = 0.001;
const R_TOP  = 0.003;   // larger fillet at top edge
const RING_N = 40;
const V_SEGS = 8;       // more segments for smooth R30 curve

const geoCache = new Map<string, THREE.BufferGeometry>();

/** Evenly-spaced points on a rounded rectangle perimeter (XZ plane, CCW from above). */
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

export function makeKeycapGeo(w: number, d: number): THREE.BufferGeometry {
  const k = `${w.toFixed(5)}_${d.toFixed(5)}`;
  if (geoCache.has(k)) return geoCache.get(k)!;

  const hw  = w / 2;
  const hd  = d / 2;
  const thw = hw * TOP_W;
  const thd = hd * TOP_D;

  const pos: number[] = [];
  const idx: number[] = [];

  // ── Side wall rings ────────────────────────────────────────────────
  // Cubic ease: straight at base (α=80°), curves inward at top (R30 fillet)
  for (let lv = 0; lv <= V_SEGS; lv++) {
    const t = lv / V_SEGS;
    const e = t * t * t;
    const y = t * KEY_H;
    for (const [x, z] of rrPts(
      hw + (thw - hw) * e,
      hd + (thd - hd) * e,
      R_BOT + (R_TOP - R_BOT) * e,
    )) {
      pos.push(x, y, z);
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

  // ── Bottom face ────────────────────────────────────────────────────
  const bc = pos.length / 3;
  pos.push(0, 0, 0);
  for (let i = 0; i < RING_N; i++) {
    idx.push(bc, i, (i + 1) % RING_N);
  }

  // ── Top face with R30 spherical dish ───────────────────────────────
  const topRing = V_SEGS * RING_N;
  const innerBases: number[] = [];
  const scales = [0.65, 0.35, 0.1];

  for (const s of scales) {
    const base = pos.length / 3;
    innerBases.push(base);
    const dep = DISH * (1 - s * s);
    for (const [x, z] of rrPts(thw * s, thd * s, R_TOP * s)) {
      pos.push(x, KEY_H - dep, z);
    }
  }

  const tc = pos.length / 3;
  pos.push(0, KEY_H - DISH, 0);

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

  // ── Finalize ───────────────────────────────────────────────────────
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();

  geoCache.set(k, geo);
  return geo;
}
