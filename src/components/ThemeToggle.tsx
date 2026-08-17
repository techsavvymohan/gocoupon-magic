import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { theme, toggle, mounted } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className="group relative grid h-9 w-9 place-items-center rounded-full border border-border/80 bg-card/80 text-foreground shadow-xs transition-all duration-300 hover:scale-110 active:scale-90 hover:border-primary hover:text-primary hover:shadow-[0_4px_16px_var(--accent-glow)]"
    >
      {/* Render icons only after mount to avoid SSR flash */}
      {mounted ? (
        isDark ? (
          <Sun size={16} className="transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110 text-amber-400" />
        ) : (
          <Moon size={16} className="transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110 text-indigo-500" />
        )
      ) : (
        <span className="block h-4 w-4" />
      )}
    </button>
  );
}
