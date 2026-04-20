import React from "react";
import ThreeScene from "../components/ThreeScene";
import "./Home.scss";

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Three.js + React Demo</h1>
        <p>欢迎来到 3D 世界！</p>
      </header>

      <div className="scene-container">
        <ThreeScene />
      </div>

      <div className="info-panel">
        <h3>控制说明</h3>
        <ul>
          <li>鼠标左键：旋转视角</li>
          <li>鼠标滚轮：缩放</li>
          <li>鼠标右键：平移</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
