"use client";

import ThemeToggle from "./ThemeToggle";
import { updateTheme } from "@/app/theme-actions";

type UserThemeToggleProps = {
  initialTheme: "light" | "dark";
};

export default function UserThemeToggle({
  initialTheme,
}: UserThemeToggleProps) {
  return (
    <ThemeToggle
      initialTheme={initialTheme}
      onThemeChange={updateTheme}
    />
  );
}