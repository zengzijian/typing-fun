import { Link, useLocation } from "react-router-dom";
import { Keyboard, Box, Crosshair } from "lucide-react";

const navItems = [
  { path: "/", label: "打字", icon: Keyboard },
  { path: "/mech-game", label: "机甲游戏", icon: Crosshair },
  { path: "/models", label: "模型库", icon: Box },
];

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-foreground tracking-tight">
          <img src="/T-icon.svg" alt="Typing Fun" className="h-5 w-5" />
          Typing Fun
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  isActive
                    ? "text-foreground bg-accent/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
