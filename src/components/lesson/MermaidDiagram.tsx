"use client";

import {
  useEffect,
  useId,
  useState,
} from "react";

import mermaid from "mermaid";

type MermaidDiagramProps = {
  code: string;
};

export default function MermaidDiagram({
  code,
}: MermaidDiagramProps) {
  const id = useId().replace(/:/g, "");

  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const [isDark, setIsDark] =
    useState(false);

  // Urmărim clasa "dark" de pe <html>
  useEffect(() => {
    const html =
      document.documentElement;

    function updateTheme() {
      setIsDark(
        html.classList.contains("dark")
      );
    }

    updateTheme();

    const observer =
      new MutationObserver(updateTheme);

    observer.observe(html, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Randăm diagrama din nou când se schimbă tema
  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      try {
        setError("");
        setSvg("");

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: isDark
            ? "dark"
            : "default",
          themeVariables: isDark
            ? {
                background: "#111827",
                primaryColor: "#1f2937",
                primaryTextColor: "#f3f4f6",
                primaryBorderColor: "#4b5563",
                lineColor: "#9ca3af",
                secondaryColor: "#172554",
                tertiaryColor: "#0f172a",
              }
            : undefined,
        });

        const result =
          await mermaid.render(
            `mermaid-${id}-${isDark ? "dark" : "light"}`,
            code
          );

        if (!cancelled) {
          setSvg(result.svg);
        }
      } catch {
        if (!cancelled) {
          setSvg("");
          setError(
            "Diagrama nu a putut fi randată."
          );
        }
      }
    }

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [code, id, isDark]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
        <p className="text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Se generează diagrama...
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-xl bg-white p-4 dark:bg-gray-900 sm:p-5"
      dangerouslySetInnerHTML={{
        __html: svg,
      }}
    />
  );
}