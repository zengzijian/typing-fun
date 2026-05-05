import React from "react";
import TableModel from "../components/models/TableModel";
import ChairModel from "../components/models/ChairModel";
import MonitorModel from "../components/models/MonitorModel";
import KeyboardModel from "../components/models/KeyboardModel";
import MouseModel from "../components/models/MouseModel";
import KeycapModel from "../components/models/KeycapModel";

export interface ModelEntry {
  id: string;
  nameKey: string;
  descKey: string;
  component: React.ReactNode;
}

export const MODEL_LIST: ModelEntry[] = [
  { id: "table",       nameKey: "modelData.table.name",     descKey: "modelData.table.desc",     component: <TableModel /> },
  { id: "chair",       nameKey: "modelData.chair.name",     descKey: "modelData.chair.desc",     component: <ChairModel /> },
  { id: "monitor",     nameKey: "modelData.monitor.name",   descKey: "modelData.monitor.desc",   component: <MonitorModel /> },
  { id: "keyboard",    nameKey: "modelData.keyboard.name",  descKey: "modelData.keyboard.desc",  component: <KeyboardModel /> },
  { id: "mouse",       nameKey: "modelData.mouse.name",     descKey: "modelData.mouse.desc",     component: <MouseModel /> },
  { id: "keycap-r1",   nameKey: "modelData.keycapR1.name",  descKey: "modelData.keycapR1.desc",  component: <KeycapModel row={1} /> },
  { id: "keycap-r2",   nameKey: "modelData.keycapR2.name",  descKey: "modelData.keycapR2.desc",  component: <KeycapModel row={2} /> },
  { id: "keycap-r3",   nameKey: "modelData.keycapR3.name",  descKey: "modelData.keycapR3.desc",  component: <KeycapModel row={3} /> },
  { id: "keycap-r4",   nameKey: "modelData.keycapR4.name",  descKey: "modelData.keycapR4.desc",  component: <KeycapModel row={4} /> },
  { id: "keycap-2u",   nameKey: "modelData.keycap2u.name",  descKey: "modelData.keycap2u.desc",  component: <KeycapModel wu={2} row={1} /> },
  { id: "keycap-225u", nameKey: "modelData.keycap225u.name", descKey: "modelData.keycap225u.desc", component: <KeycapModel wu={2.25} row={3} /> },
  { id: "keycap-625u", nameKey: "modelData.keycap625u.name", descKey: "modelData.keycap625u.desc", component: <KeycapModel wu={6.25} row={4} color="#ddeeff" /> },
];
