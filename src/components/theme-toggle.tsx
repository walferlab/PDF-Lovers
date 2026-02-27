"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-sm text-slate-500"
        aria-label="Toggle theme"
      >
        Theme
      </button>
    );
  }

  const current = theme === "system" ? resolvedTheme : theme;

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/70 p-1 text-xs dark:border-white/20 dark:bg-slate-900/70">
      <button
        type="button"
        className={cn(
          "rounded-full px-2 py-1",
          theme === "system" && "bg-slate-900 text-white dark:bg-white dark:text-slate-900",
        )}
        onClick={() => setTheme("system")}
      >
        Auto
      </button>
      <button
        type="button"
        className={cn(
          "rounded-full px-2 py-1",
          current === "light" && "bg-slate-900 text-white dark:bg-white dark:text-slate-900",
        )}
        onClick={() => setTheme("light")}
      >
        Light
      </button>
      <button
        type="button"
        className={cn(
          "rounded-full px-2 py-1",
          current === "dark" && "bg-slate-900 text-white dark:bg-white dark:text-slate-900",
        )}
        onClick={() => setTheme("dark")}
      >
        Dark
      </button>
    </div>
  );
}
