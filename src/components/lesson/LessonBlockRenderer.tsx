type LessonBlock = {
  id: string;
  type: string;
  content: Record<string, unknown>;
};

type LessonBlockRendererProps = {
  block: LessonBlock;
};

export default function LessonBlockRenderer({
  block,
}: LessonBlockRendererProps) {
  if (block.type === "HEADING") {
    const text = String(block.content.text ?? "");
    const level = String(block.content.level ?? "2");

    if (level === "3") {
      return (
        <h3 className="text-xl font-semibold text-gray-900">
          {text}
        </h3>
      );
    }

    if (level === "4") {
      return (
        <h4 className="text-lg font-semibold text-gray-900">
          {text}
        </h4>
      );
    }

    return (
      <h2 className="text-2xl font-bold text-gray-900">
        {text}
      </h2>
    );
  }

  if (block.type === "TEXT") {
    const text = String(block.content.text ?? "");

    return (
      <p className="whitespace-pre-line leading-7 text-gray-700">
        {text}
      </p>
    );
  }

  if (block.type === "CODE") {
    const code = String(block.content.code ?? "");
    const language = String(block.content.language ?? "text");

    return (
      <div className="overflow-hidden rounded-xl bg-gray-950">
        <div className="border-b border-gray-800 px-4 py-2">
          <span className="text-xs font-medium uppercase text-gray-400">
            {language}
          </span>
        </div>

        <pre className="overflow-x-auto p-4 text-sm leading-6 text-gray-100">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-gray-300 p-4">
      <p className="text-sm text-gray-500">
        Tip de bloc necunoscut: {block.type}
      </p>
    </div>
  );
}