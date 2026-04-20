import React from "react";
import "./About.scss";

const About: React.FC = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1>关于项目</h1>
        <div className="about-card">
          <h2>技术栈</h2>
          <ul>
            <li>
              <strong>Vite</strong> - 快速的前端构建工具
            </li>
            <li>
              <strong>React 18</strong> - 现代化的前端框架
            </li>
            <li>
              <strong>TypeScript</strong> - 类型安全的 JavaScript
            </li>
            <li>
              <strong>Three.js</strong> - 3D 图形库
            </li>
            <li>
              <strong>React Three Fiber</strong> - React 的 Three.js 渲染器
            </li>
            <li>
              <strong>React Router</strong> - 客户端路由
            </li>
            <li>
              <strong>Sass</strong> - CSS 预处理器
            </li>
            <li>
              <strong>Ant Design</strong> - UI 组件库
            </li>
          </ul>
        </div>

        <div className="about-card">
          <h2>项目特性</h2>
          <ul>
            <li>🚀 基于 Vite 的快速开发体验</li>
            <li>⚛️ React 18 + TypeScript 开发</li>
            <li>🎨 Three.js 3D 渲染能力</li>
            <li>🛣️ React Router 单页面应用路由</li>
            <li>💅 现代化的 UI 设计</li>
            <li>📱 响应式布局支持</li>
          </ul>
        </div>

        <div className="about-card">
          <h2>开发说明</h2>
          <p>
            这是一个基于 Vite + React 的现代化前端 SPA 项目脚手架，集成了
            Three.js 用于 3D 渲染。
          </p>
          <p>项目采用了最新的前端技术栈，提供了良好的开发体验和性能表现。</p>
        </div>
      </div>
    </div>
  );
};

export default About;
