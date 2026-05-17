import { Link, useLocation } from "react-router-dom";
import { Keyboard, Box, Crosshair, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

const LANGS = ["en", "zh-CN", "zh-HK"] as const;
type Lang = (typeof LANGS)[number];

const LANG_LABELS: Record<Lang, string> = {
  "zh-CN": "简",
  "zh-HK": "繁",
  en: "EN",
};

const LANG_TOOLTIPS: Record<Lang, string> = {
  "zh-CN": "简体中文",
  "zh-HK": "繁體中文",
  en: "English",
};

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip">
      {children}
      <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-popover text-popover-foreground text-xs whitespace-nowrap shadow-md opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50">
        {label}
      </span>
    </div>
  );
}

const Navigation = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const currentLang = (LANGS.includes(i18n.language as Lang) ? i18n.language : "en") as Lang;

  const navItems = [
    { path: "/", label: t("nav.typing"), icon: Keyboard },
    { path: "/mech-game", label: t("nav.mechGame"), icon: Crosshair },
    { path: "/models", label: t("nav.models"), icon: Box },
    { path: "/ranking", label: t("nav.leaderboard"), icon: Trophy },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-base">
          <img src="/favicon.png" alt="Typing Fun" className="h-12 w-12 rounded-sm object-cover" />
          <span className="brand-typing">Typing</span>{' '}<span className="brand-fun">Fun</span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Tooltip key={item.path} label={item.label}>
                <Link
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
              </Tooltip>
            );
          })}

          <div className="ml-2 flex items-center rounded-md border border-border overflow-hidden">
            {LANGS.map((lang) => {
              const isActive = currentLang === lang;
              return (
                <Tooltip key={lang} label={LANG_TOOLTIPS[lang]}>
                  <button
                    onClick={() => i18n.changeLanguage(lang)}
                    className={`px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                    }`}
                  >
                    {LANG_LABELS[lang]}
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
