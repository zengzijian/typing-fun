# Vite + React + Three.js SPA 项目脚手架

一个现代化的前端单页面应用项目脚手架，集成了 3D 渲染能力。

## 🚀 技术栈

- **Vite** - 快速的前端构建工具
- **React 18** - 现代化的前端框架
- **TypeScript** - 类型安全的 JavaScript
- **Three.js** - 3D 图形库
- **React Three Fiber** - React 的 Three.js 渲染器
- **React Three Drei** - Three.js 的实用工具库
- **React Router** - 客户端路由
- **Sass** - CSS 预处理器
- **Ant Design** - UI 组件库

## 📦 安装依赖

```bash
# 使用 yarn
yarn install

# 或使用 npm
npm install
```

## 🛠️ 开发

```bash
# 启动开发服务器
yarn dev

# 或
npm run dev
```

开发服务器将在 `http://localhost:5173` 启动。

## 🏗️ 构建

```bash
# 构建生产版本
yarn build

# 或
npm run build
```

## 🎯 项目特性

### ⚡ 极速开发体验

- 基于 Vite 的快速热重载
- TypeScript 支持
- 现代化的开发工具链

### 🎨 3D 渲染能力

- 集成 Three.js 和 React Three Fiber
- 响应式的 3D 场景
- 交互式的相机控制

### 🛣️ 路由管理

- React Router 单页面应用路由
- 代码分割和懒加载支持
- 嵌套路由支持

### 💅 现代化 UI

- 响应式设计
- 现代化的视觉效果
- 流畅的动画和过渡

## 📁 项目结构

```
src/
├── components/          # 可复用组件
│   ├── Navigation.tsx   # 导航组件
│   ├── ThreeScene.tsx   # Three.js 3D 场景组件
│   └── *.scss          # 组件样式
├── pages/              # 页面组件
│   ├── Welcome.tsx     # 欢迎页
│   ├── Home.tsx        # 3D Demo 页面
│   ├── About.tsx       # 关于页面
│   └── *.scss          # 页面样式
├── assets/             # 静态资源
├── App.tsx             # 根组件
├── main.tsx            # 应用入口
└── index.css           # 全局样式
```

## 🎮 3D Demo 功能

在 `/home` 页面，你可以体验：

- **旋转立方体** - 展示基础的 3D 动画
- **浮动球体** - 线框材质和浮动动画
- **旋转环形** - 复杂几何体的渲染
- **交互控制** - 鼠标控制相机视角
- **光照系统** - 环境光、方向光和点光源

### 控制说明

- 🖱️ **鼠标左键** - 旋转视角
- 🖱️ **鼠标滚轮** - 缩放
- 🖱️ **鼠标右键** - 平移

## 🔧 自定义配置

### Vite 配置

编辑 `vite.config.ts` 来自定义构建配置。

### TypeScript 配置

- `tsconfig.json` - 主要的 TypeScript 配置
- `tsconfig.app.json` - 应用特定配置
- `tsconfig.node.json` - Node.js 环境配置

### ESLint 配置

编辑 `eslint.config.js` 来自定义代码规范。

## 📚 学习资源

- [Vite 文档](https://vitejs.dev/)
- [React 文档](https://react.dev/)
- [Three.js 文档](https://threejs.org/docs/)
- [React Three Fiber 文档](https://docs.pmnd.rs/react-three-fiber/)
- [React Router 文档](https://reactrouter.com/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
