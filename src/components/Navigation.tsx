import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navigation.scss";

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "首页", icon: "🏠" },
    { path: "/home", label: "3D Demo", icon: "🎮" },
    { path: "/models", label: "模型库", icon: "📦" },
    { path: "/typing", label: "打字", icon: "⌨️" },
    { path: "/about", label: "关于", icon: "ℹ️" },
  ];

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h2>Vite + React + Three.js</h2>
      </div>

      <ul className="nav-menu">
        {navItems.map((item) => (
          <li key={item.path} className="nav-item">
            <Link
              to={item.path}
              className={`nav-link ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
