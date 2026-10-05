"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="text-gray-400 opacity-50 flex items-center justify-center shrink-0 w-5 h-5">
        <Sun className="h-5 w-5" strokeWidth={2.5} />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center shrink-0 w-5 h-5"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" strokeWidth={2.5} />
      ) : (
        <Moon className="h-5 w-5" strokeWidth={2.5} />
      )}
    </button>
  );
}
