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
      className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-card/60 text-foreground transition-colors hover:border-primary/40 hover:text-primary"
    >
      {/* Render icons only after mount to avoid SSR flash */}
      {mounted ? (
        isDark ? <Sun size={16} /> : <Moon size={16} />
      ) : (
        <span className="block h-4 w-4" />
      )}
    </button>
  );
}
