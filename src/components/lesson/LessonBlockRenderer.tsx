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
  // -------------------------------------------------------
  // HEADING
  // -------------------------------------------------------

  if (block.type === "HEADING") {
    const text = String(block.content.text ?? "");
    const level = String(block.content.level ?? "2");

    if (level === "3") {
      return (
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 sm:text-2xl">
          {text}
        </h3>
      );
    }

    if (level === "4") {
      return (
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 sm:text-xl">
          {text}
        </h4>
      );
    }

    return (
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
        {text}
      </h2>
    );
  }

  // -------------------------------------------------------
  // TEXT
  // -------------------------------------------------------

  if (block.type === "TEXT") {
    const text = String(block.content.text ?? "");

    return (
      <p className="whitespace-pre-line text-base leading-7 text-gray-700 dark:text-gray-300 sm:text-[1.05rem] sm:leading-8">
        {text}
      </p>
    );
  }

  // -------------------------------------------------------
  // CODE
  // -------------------------------------------------------

  if (block.type === "CODE") {
    const code = String(block.content.code ?? "");
    const language = String(
      block.content.language ?? "text"
    );

    return (
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950 shadow-sm">
        <div className="border-b border-gray-800 bg-gray-900 px-4 py-2">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
            {language}
          </span>
        </div>

        <pre className="overflow-x-auto p-4 text-sm leading-6 text-gray-100 sm:p-5">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  // -------------------------------------------------------
  // CALLOUT
  // -------------------------------------------------------

  if (block.type === "CALLOUT") {
    const variant = String(
      block.content.variant ?? "info"
    );

    const title = String(
      block.content.title ?? ""
    );

    const text = String(
      block.content.text ?? ""
    );

    const styles = {
      info:
        "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-800/70 dark:bg-blue-950/30 dark:text-blue-100",

      tip:
        "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-800/70 dark:bg-emerald-950/30 dark:text-emerald-100",

      warning:
        "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800/70 dark:bg-amber-950/25 dark:text-amber-100",

      success:
        "border-green-200 bg-green-50 text-green-950 dark:border-green-800/70 dark:bg-green-950/25 dark:text-green-100",
    };

    const className =
      styles[variant as keyof typeof styles] ??
      styles.info;

    return (
      <div
        className={`rounded-xl border-l-4 p-5 shadow-sm ${className}`}
      >
        {title && (
          <p className="mb-2 font-semibold">
            {title}
          </p>
        )}

        <p className="whitespace-pre-line leading-7">
          {text}
        </p>
      </div>
    );
  }

  // -------------------------------------------------------
  // DIVIDER
  // -------------------------------------------------------

  if (block.type === "DIVIDER") {
    return (
      <hr className="my-6 border-t border-gray-300 dark:border-gray-700 sm:my-8" />
    );
  }

  // -------------------------------------------------------
  // IMAGE
  // -------------------------------------------------------

  if (block.type === "IMAGE") {
    const signedUrl =
      typeof block.content.signedUrl === "string"
        ? block.content.signedUrl
        : null;

    const alt = String(
      block.content.alt ?? ""
    );

    const caption = String(
      block.content.caption ?? ""
    );

    if (!signedUrl) {
      return (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Imaginea nu poate fi afișată momentan.
          </p>
        </div>
      );
    }

    return (
      <figure className="space-y-3">
        <img
          src={signedUrl}
          alt={alt}
          className="mx-auto max-h-[700px] w-full rounded-xl border border-gray-200 object-contain shadow-sm dark:border-gray-700"
        />

        {caption && (
          <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  // -------------------------------------------------------
  // DIAGRAM
  // -------------------------------------------------------

  if (block.type === "DIAGRAM") {
    const code = String(
      block.content.code ?? ""
    );

    if (!code) {
      return (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Diagrama nu conține cod Mermaid.
          </p>
        </div>
      );
    }

    return <MermaidDiagram code={code} />;
  }

  // -------------------------------------------------------
  // QUIZ
  // -------------------------------------------------------

  if (block.type === "QUIZ") {
    const question = String(
      block.content.question ?? ""
    );

    const answers = Array.isArray(
      block.content.answers
    )
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

    if (
      !question ||
      answers.length === 0
    ) {
      return (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
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

  // -------------------------------------------------------
  // VIDEO
  // -------------------------------------------------------

  if (block.type === "VIDEO") {
    const url = String(
      block.content.url ?? ""
    );

    const title = String(
      block.content.title ?? "Video"
    );

    let embedUrl: string | null = null;

    try {
      const parsedUrl = new URL(url);

      if (
        parsedUrl.hostname ===
          "www.youtube.com" ||
        parsedUrl.hostname ===
          "youtube.com"
      ) {
        const videoId =
          parsedUrl.searchParams.get("v");

        if (videoId) {
          embedUrl =
            `https://www.youtube.com/embed/${videoId}`;
        }
      }

      if (
        parsedUrl.hostname === "youtu.be"
      ) {
        const videoId =
          parsedUrl.pathname.replace(
            "/",
            ""
          );

        if (videoId) {
          embedUrl =
            `https://www.youtube.com/embed/${videoId}`;
        }
      }
    } catch {
      embedUrl = null;
    }

    if (!embedUrl) {
      return (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Link video invalid sau nesuportat.
          </p>
        </div>
      );
    }

    return (
      <figure className="space-y-3">
        <div className="aspect-video overflow-hidden rounded-xl border border-gray-200 bg-black shadow-sm dark:border-gray-700">
          <iframe
            src={embedUrl}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {title && (
          <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400">
            {title}
          </figcaption>
        )}
      </figure>
    );
  }

  // -------------------------------------------------------
  // FILE
  // -------------------------------------------------------

  if (block.type === "FILE") {
    const signedUrl =
      typeof block.content.signedUrl ===
      "string"
        ? block.content.signedUrl
        : null;

    const originalName = String(
      block.content.originalName ??
        "Fișier"
    );

    const title = String(
      block.content.title ??
        originalName
    );

    const description = String(
      block.content.description ?? ""
    );

    if (!signedUrl) {
      return (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Fișierul nu poate fi descărcat momentan.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6">
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </p>

          {description && (
            <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {description}
            </p>
          )}

          <p className="mt-2 break-all text-xs text-gray-400 dark:text-gray-500">
            {originalName}
          </p>
        </div>

        <a
          href={signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
        >
          Descarcă fișierul
        </a>
      </div>
    );
  }

  // -------------------------------------------------------
  // LAYOUT
  // -------------------------------------------------------

  if (block.type === "LAYOUT") {
    const template = String(
      block.content.template ??
        "two-columns-50-50"
    );

    const supportedTemplates = [
      "two-columns-50-50",
      "two-columns-33-67",
      "two-columns-67-33",
      "media-left",
      "media-right",
    ];

    if (
      !supportedTemplates.includes(
        template
      )
    ) {
      return (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Template layout nesuportat.
          </p>
        </div>
      );
    }

    const layoutClasses =
      template ===
      "two-columns-33-67"
        ? "grid grid-cols-1 gap-6 md:grid-cols-[1fr_2fr]"
        : template ===
            "two-columns-67-33"
          ? "grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]"
          : template === "media-left"
            ? "grid grid-cols-1 gap-6 md:grid-cols-[2fr_3fr]"
            : template === "media-right"
              ? "grid grid-cols-1 gap-6 md:grid-cols-[3fr_2fr]"
              : "grid grid-cols-1 gap-6 md:grid-cols-2";

    const left =
      layoutChildren?.left ?? [];

    const right =
      layoutChildren?.right ?? [];

    return (
      <div className={layoutClasses}>
        <div className="min-w-0 space-y-4">
          {left.map((child) => (
            <LessonBlockRenderer
              key={child.id}
              block={child}
            />
          ))}
        </div>

        <div className="min-w-0 space-y-4">
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

  // -------------------------------------------------------
  // UNKNOWN
  // -------------------------------------------------------

  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Tip de bloc necunoscut:{" "}
        {block.type}
      </p>
    </div>
  );
}