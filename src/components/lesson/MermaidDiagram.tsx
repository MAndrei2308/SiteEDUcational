"use client";

import { useEffect, useId, useState } from "react";
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

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      try {
        setError("");

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
        });

        const result = await mermaid.render(
          `mermaid-${id}`,
          code
        );

        if (!cancelled) {
          setSvg(result.svg);
        }
      } catch {
        if (!cancelled) {
          setSvg("");
          setError("Diagrama nu a putut fi randată.");
        }
      }
    }

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [code, id]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">
          {error}
        </p>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-500">
          Se generează diagrama...
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}