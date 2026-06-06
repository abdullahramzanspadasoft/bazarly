"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/theme";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
      title={isDark ? "Day mode" : "Night mode"}
      className={cn(
        "relative p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
        className
      )}
    >
      <Sun
        className={cn(
          "w-5 h-5 transition-all duration-300",
          isDark ? "scale-0 rotate-90 opacity-0 absolute" : "scale-100 rotate-0 opacity-100"
        )}
      />
      <Moon
        className={cn(
          "w-5 h-5 transition-all duration-300",
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0 absolute"
        )}
      />
    </button>
  );
}
