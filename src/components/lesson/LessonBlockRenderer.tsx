import MermaidDiagram from "@/components/lesson/MermaidDiagram";
import QuizBlock from "@/components/lesson/QuizBlock";

type LessonBlock = {
  id: string;
  type: string;
  content: Record<string, unknown>;
};

type LessonBlockRendererProps = {
  block: LessonBlock;
  layoutChildren?: {
    left: LessonBlock[];
    right: LessonBlock[];
  };
};

export default function LessonBlockRenderer({
  block,
  layoutChildren,
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

  if (block.type === "CALLOUT") {
    const variant = String(block.content.variant ?? "info");
    const title = String(block.content.title ?? "");
    const text = String(block.content.text ?? "");

    const styles = {
      info: "border-blue-200 bg-blue-50 text-blue-900",
      tip: "border-emerald-200 bg-emerald-50 text-emerald-900",
      warning: "border-amber-200 bg-amber-50 text-amber-900",
      success: "border-green-200 bg-green-50 text-green-900",
    };

    const className =
      styles[variant as keyof typeof styles] ?? styles.info;

    return (
      <div className={`rounded-xl border p-4 ${className}`}>
        {title && (
          <p className="mb-1 font-semibold">
            {title}
          </p>
        )}

        <p className="whitespace-pre-line leading-7">
          {text}
        </p>
      </div>
    );
  }

  if (block.type === "DIVIDER") {
    return (
      <hr className="my-6 border-t border-gray-300" />
    );
  }

  if (block.type === "IMAGE") {
    const signedUrl =
      typeof block.content.signedUrl === "string"
        ? block.content.signedUrl
        : null;

    const alt = String(block.content.alt ?? "");
    const caption = String(block.content.caption ?? "");

    if (!signedUrl) {
      return (
        <div className="rounded-lg border border-dashed border-gray-300 p-4">
          <p className="text-sm text-gray-500">
            Imaginea nu poate fi afișată momentan.
          </p>
        </div>
      );
    }

    return (
      <figure className="space-y-2">
        <img
          src={signedUrl}
          alt={alt}
          className="w-full rounded-xl border border-gray-200"
        />

        {caption && (
          <figcaption className="text-center text-sm text-gray-500">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (block.type === "DIAGRAM") {
    const code = String(block.content.code ?? "");

    if (!code) {
      return (
        <div className="rounded-lg border border-dashed border-gray-300 p-4">
          <p className="text-sm text-gray-500">
            Diagrama nu conține cod Mermaid.
          </p>
        </div>
      );
    }

    return <MermaidDiagram code={code} />;
  }

  if (block.type === "QUIZ") {
    const question = String(
      block.content.question ?? ""
    );

    const answers = Array.isArray(block.content.answers)
      ? block.content.answers.map((answer) =>
          String(answer)
        )
      : [];

    const correctAnswer = Number(
      block.content.correctAnswer ?? 0
    );

    const explanation = String(
      block.content.explanation ?? ""
    );

    if (!question || answers.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-gray-300 p-4">
          <p className="text-sm text-gray-500">
            Quiz-ul nu este configurat corect.
          </p>
        </div>
      );
    }

    return (
      <QuizBlock
        question={question}
        answers={answers}
        correctAnswer={correctAnswer}
        explanation={explanation}
      />
    );
  }

  if (block.type === "VIDEO") {
    const url = String(block.content.url ?? "");
    const title = String(block.content.title ?? "Video");

    let embedUrl: string | null = null;

    try {
      const parsedUrl = new URL(url);

      if (
        parsedUrl.hostname === "www.youtube.com" ||
        parsedUrl.hostname === "youtube.com"
      ) {
        const videoId = parsedUrl.searchParams.get("v");

        if (videoId) {
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      }

      if (parsedUrl.hostname === "youtu.be") {
        const videoId = parsedUrl.pathname.replace("/", "");

        if (videoId) {
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      }
    } catch {
      embedUrl = null;
    }

    if (!embedUrl) {
      return (
        <div className="rounded-lg border border-dashed border-gray-300 p-4">
          <p className="text-sm text-gray-500">
            Link video invalid sau nesuportat.
          </p>
        </div>
      );
    }

    return (
      <figure className="space-y-2">
        <div className="aspect-video overflow-hidden rounded-xl">
          <iframe
            src={embedUrl}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {title && (
          <figcaption className="text-center text-sm text-gray-500">
            {title}
          </figcaption>
        )}
      </figure>
    );
  }

  if (block.type === "FILE") {
    const signedUrl =
      typeof block.content.signedUrl === "string"
        ? block.content.signedUrl
        : null;

    const originalName = String(
      block.content.originalName ?? "Fișier"
    );

    const title = String(
      block.content.title ?? originalName
    );

    const description = String(
      block.content.description ?? ""
    );

    if (!signedUrl) {
      return (
        <div className="rounded-lg border border-dashed border-gray-300 p-4">
          <p className="text-sm text-gray-500">
            Fișierul nu poate fi descărcat momentan.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-gray-200 p-5">
        <div>
          <p className="font-semibold text-gray-900">
            {title}
          </p>

          {description && (
            <p className="mt-1 text-sm text-gray-600">
              {description}
            </p>
          )}

          <p className="mt-2 text-xs text-gray-400">
            {originalName}
          </p>
        </div>

        <a
          href={signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          Descarcă fișierul
        </a>
      </div>
    );
  }

  if (block.type === "LAYOUT") {
    const template = String(
      block.content.template ?? "two-columns-50-50"
    );

    const supportedTemplates = [
      "two-columns-50-50",
      "two-columns-33-67",
      "two-columns-67-33",
    ];

    if (!supportedTemplates.includes(template)) {
      return (
        <div className="rounded-lg border border-dashed border-gray-300 p-4">
          <p className="text-sm text-gray-500">
            Template layout nesuportat.
          </p>
        </div>
      );
    }

    const gridStyle =
      template === "two-columns-33-67"
        ? { gridTemplateColumns: "1fr 2fr" }
        : template === "two-columns-67-33"
          ? { gridTemplateColumns: "2fr 1fr" }
          : { gridTemplateColumns: "1fr 1fr" };

    const left = layoutChildren?.left ?? [];
    const right = layoutChildren?.right ?? [];

    return (
      <div
        className="grid gap-6"
        style={gridStyle}
      >
        <div className="space-y-4">
          {left.map((child) => (
            <LessonBlockRenderer
              key={child.id}
              block={child}
            />
          ))}
        </div>

        <div className="space-y-4">
          {right.map((child) => (
            <LessonBlockRenderer
              key={child.id}
              block={child}
            />
          ))}
        </div>
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