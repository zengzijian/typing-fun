import React, { useState } from "react";
import ModelViewer from "../components/ModelViewer";
import TableModel from "../components/models/TableModel";
import ChairModel from "../components/models/ChairModel";
import MonitorModel from "../components/models/MonitorModel";
import KeyboardModel from "../components/models/KeyboardModel";
import MouseModel from "../components/models/MouseModel";
import KeycapModel from "../components/models/KeycapModel";

interface ModelEntry {
  id: string;
  name: string;
  description: string;
  component: React.ReactNode;
}

const MODEL_LIST: ModelEntry[] = [
  { id: "table",    name: "桌子",   description: "实木办公桌，带四条桌腿",          component: <TableModel /> },
  { id: "chair",    name: "椅子",   description: "木质椅子，带双横梁靠背",          component: <ChairModel /> },
  { id: "monitor",  name: "显示器", description: "宽屏显示器，带颈部支架和底座",    component: <MonitorModel /> },
  { id: "keyboard", name: "键盘",   description: "全尺寸薄膜键盘",                  component: <KeyboardModel /> },
  { id: "mouse",    name: "鼠标",   description: "光学鼠标，带滚轮",                component: <MouseModel /> },
  { id: "keycap-1u",    name: "键帽 1u",    description: "标准键（字母 / 数字 / 符号）",  component: <KeycapModel wu={1} /> },
  { id: "keycap-125u", name: "键帽 1.25u", description: "Ctrl / Win / Alt",             component: <KeycapModel wu={1.25} /> },
  { id: "keycap-15u",  name: "键帽 1.5u",  description: "Tab / 反斜杠",                  component: <KeycapModel wu={1.5} /> },
  { id: "keycap-175u", name: "键帽 1.75u", description: "Caps Lock",                    component: <KeycapModel wu={1.75} /> },
  { id: "keycap-2u",   name: "键帽 2u",    description: "Backspace / Left Shift",       component: <KeycapModel wu={2} /> },
  { id: "keycap-225u", name: "键帽 2.25u", description: "Enter",                        component: <KeycapModel wu={2.25} /> },
  { id: "keycap-625u", name: "键帽 6.25u", description: "Space",                        component: <KeycapModel wu={6.25} color="#ddeeff" /> },
];

const Models: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = MODEL_LIST.find((m) => m.id === selectedId);

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {selected ? (
        /* ── 全屏预览 ── */
        <div className="flex flex-col h-[calc(100vh-64px)]">
          <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10">
            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              ← 返回
            </button>
            <span className="text-white/30">|</span>
            <span className="font-semibold">{selected.name}</span>
            <span className="text-slate-400 text-sm">{selected.description}</span>
          </div>
          <div className="flex-1">
            <ModelViewer autoRotate={false}>{selected.component}</ModelViewer>
          </div>
        </div>
      ) : (
        /* ── 网格浏览 ── */
        <div className="px-8 py-8">
          <h1 className="text-2xl font-bold mb-2">3D 模型库</h1>
          <p className="text-slate-400 text-sm mb-8">点击任意模型进入全屏预览，支持旋转 / 缩放</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {MODEL_LIST.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedId(model.id)}
                className="group relative rounded-xl overflow-hidden bg-slate-800 border border-white/10
                           hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-500/10
                           transition-all duration-200 text-left"
              >
                {/* 缩略图 Canvas */}
                <div className="h-44 w-full">
                  <ModelViewer autoRotate={false}>{model.component}</ModelViewer>
                </div>

                {/* 卡片信息 */}
                <div className="px-4 py-3">
                  <p className="font-semibold text-sm">{model.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{model.description}</p>
                </div>

                {/* hover 蒙层提示 */}
                <div className="absolute inset-0 flex items-center justify-center
                                bg-blue-600/0 group-hover:bg-blue-600/10
                                transition-colors pointer-events-none">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity
                                   bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs">
                    全屏预览
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Models;
