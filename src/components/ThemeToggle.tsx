"use client";

import { useState, useTransition } from "react";
import { updateTheme } from "@/app/theme-actions";

type ThemeToggleProps = {
  initialTheme: "light" | "dark";
};

export default function ThemeToggle({
  initialTheme,
}: ThemeToggleProps) {
  const [theme, setTheme] =
    useState<"light" | "dark">(initialTheme);

  const [isPending, startTransition] =
    useTransition();

  function changeTheme(
    newTheme: "light" | "dark"
  ) {
    if (newTheme === theme) {
      return;
    }

    setTheme(newTheme);

    document.documentElement.classList.toggle(
      "dark",
      newTheme === "dark"
    );

    startTransition(async () => {
      await updateTheme(newTheme);
    });
  }

  return (
    <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
      <button
        type="button"
        disabled={isPending}
        onClick={() => changeTheme("light")}
        className={`rounded-md px-2.5 py-1.5 text-sm transition ${
          theme === "light"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-400 hover:text-white"
        }`}
        aria-label="Folosește tema luminoasă"
      >
        ☀️
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={() => changeTheme("dark")}
        className={`rounded-md px-2.5 py-1.5 text-sm transition ${
          theme === "dark"
            ? "bg-gray-700 text-white shadow-sm"
            : "text-gray-500 hover:text-gray-900"
        }`}
        aria-label="Folosește tema întunecată"
      >
        🌙
      </button>
    </div>
  );
}