import React from "react";
import { Link } from "react-router-dom";
import "./Welcome.scss";

const Welcome: React.FC = () => {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="welcome-hero">
          <h1 className="welcome-title">
            欢迎来到
            <span className="gradient-text">Vite + React + Three.js</span>
            项目
          </h1>
          <p className="welcome-subtitle">
            现代化的前端 SPA 项目脚手架，集成 3D 渲染能力
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>极速开发</h3>
            <p>基于 Vite 的快速构建工具，提供闪电般的开发体验</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚛️</div>
            <h3>现代 React</h3>
            <p>使用 React 18 + TypeScript，享受类型安全的开发体验</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>3D 渲染</h3>
            <p>集成 Three.js 和 React Three Fiber，轻松创建 3D 场景</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🛣️</div>
            <h3>路由管理</h3>
            <p>使用 React Router 实现单页面应用的路由管理</p>
          </div>
        </div>

        <div className="action-buttons">
          <Link to="/home" className="btn btn-primary">
            体验 3D Demo
          </Link>
          <Link to="/about" className="btn btn-secondary">
            了解更多
          </Link>
        </div>
      </div>

      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
    </div>
  );
};

export default Welcome;
