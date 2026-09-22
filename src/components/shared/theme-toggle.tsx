"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme">
        <Sun className="h-5 w-5 opacity-0" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 transition-all text-amber-400" />
      ) : (
        <Moon className="h-5 w-5 transition-all text-zinc-700" />
      )}
    </Button>
  );
}
