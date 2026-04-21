import React from "react";
import TableModel from "../components/models/TableModel";
import ChairModel from "../components/models/ChairModel";
import MonitorModel from "../components/models/MonitorModel";
import KeyboardModel from "../components/models/KeyboardModel";
import MouseModel from "../components/models/MouseModel";
import KeycapModel from "../components/models/KeycapModel";

export interface ModelEntry {
  id: string;
  name: string;
  description: string;
  component: React.ReactNode;
}

export const MODEL_LIST: ModelEntry[] = [
  { id: "table",       name: "桌子",       description: "实木办公桌，带四条桌腿",        component: <TableModel /> },
  { id: "chair",       name: "椅子",       description: "木质椅子，带双横梁靠背",        component: <ChairModel /> },
  { id: "monitor",     name: "显示器",     description: "宽屏显示器，带颈部支架和底座",  component: <MonitorModel /> },
  { id: "keyboard",    name: "键盘",       description: "全尺寸薄膜键盘",                component: <KeyboardModel /> },
  { id: "mouse",       name: "鼠标",       description: "光学鼠标，带滚轮",              component: <MouseModel /> },
  { id: "keycap-r1",   name: "键帽 R1",    description: "数字行 — 11.2mm，后仰 3°",      component: <KeycapModel row={1} /> },
  { id: "keycap-r2",   name: "键帽 R2",    description: "QWERTY 行 — 9.45mm，前倾 1°",  component: <KeycapModel row={2} /> },
  { id: "keycap-r3",   name: "键帽 R3",    description: "Home 行 — 9.0mm，前倾 6°",      component: <KeycapModel row={3} /> },
  { id: "keycap-r4",   name: "键帽 R4",    description: "底行 — 9.25mm，前倾 9°",        component: <KeycapModel row={4} /> },
  { id: "keycap-2u",   name: "键帽 2u",    description: "Backspace / Left Shift (R1)",   component: <KeycapModel wu={2} row={1} /> },
  { id: "keycap-225u", name: "键帽 2.25u", description: "Enter (R3)",                    component: <KeycapModel wu={2.25} row={3} /> },
  { id: "keycap-625u", name: "键帽 6.25u", description: "Space (R4) — 6.25u",            component: <KeycapModel wu={6.25} row={4} color="#ddeeff" /> },
];
