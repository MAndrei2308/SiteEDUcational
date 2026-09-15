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

    const customIcon =
      typeof block.content.icon === "string"
        ? block.content.icon
        : null;

    if (level === "3") {
      return (
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 shrink-0 rounded-full bg-violet-500" />

          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 sm:text-2xl">
            {text}
          </h3>
        </div>
      );
    }

    if (level === "4") {
      return (
        <h4 className="border-l-4 border-violet-400 pl-4 text-lg font-semibold text-gray-900 dark:border-violet-600 dark:text-gray-100 sm:text-xl">
          {text}
        </h4>
      );
    }

    return (
      <div className="overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 shadow-sm dark:border-blue-900/60 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-violet-950/30">
        <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-2xl shadow-sm dark:bg-blue-500">
            {customIcon ?? "📘"}
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            {text}
          </h2>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // TEXT
  // -------------------------------------------------------

  if (block.type === "TEXT") {
    const text = String(block.content.text ?? "");

    return (
      <p className="whitespace-pre-line text-base leading-8 text-gray-700 dark:text-gray-200 sm:text-[1.05rem]">
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

    const customIcon =
      typeof block.content.icon === "string"
        ? block.content.icon
        : null;

    const variants = {
      info: {
        icon: "💡",
        container:
          "border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 dark:border-blue-900/70 dark:from-blue-950/40 dark:to-sky-950/20",
        iconBox:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200",
        title:
          "text-blue-950 dark:text-blue-100",
        text:
          "text-blue-950/80 dark:text-blue-100/80",
      },

      tip: {
        icon: "✨",
        container:
          "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-900/70 dark:from-emerald-950/40 dark:to-teal-950/20",
        iconBox:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200",
        title:
          "text-emerald-950 dark:text-emerald-100",
        text:
          "text-emerald-950/80 dark:text-emerald-100/80",
      },

      warning: {
        icon: "⚠️",
        container:
          "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-900/70 dark:from-amber-950/35 dark:to-orange-950/20",
        iconBox:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200",
        title:
          "text-amber-950 dark:text-amber-100",
        text:
          "text-amber-950/80 dark:text-amber-100/80",
      },

      success: {
        icon: "✅",
        container:
          "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-900/70 dark:from-green-950/35 dark:to-emerald-950/20",
        iconBox:
          "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-200",
        title:
          "text-green-950 dark:text-green-100",
        text:
          "text-green-950/80 dark:text-green-100/80",
      },
    };

    const style =
      variants[variant as keyof typeof variants] ??
      variants.info;

    return (
      <div
        className={`rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6 ${style.container}`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${style.iconBox}`}
          >
            {customIcon ?? style.icon}
          </div>

          <div className="min-w-0">
            {title && (
              <p
                className={`text-base font-bold sm:text-lg ${style.title}`}
              >
                {title}
              </p>
            )}

            <p
              className={`whitespace-pre-line leading-7 ${
                title ? "mt-2" : ""
              } ${style.text}`}
            >
              {text}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // DIVIDER
  // -------------------------------------------------------

  if (block.type === "DIVIDER") {
    return (
      <div className="flex items-center gap-3 py-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-gray-300 dark:via-gray-700 dark:to-gray-700" />

        <div className="h-2.5 w-2.5 rounded-full bg-violet-400 dark:bg-violet-500" />

        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gray-300 to-gray-300 dark:via-gray-700 dark:to-gray-700" />
      </div>
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
      <figure className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="bg-gray-50 p-3 dark:bg-gray-950/50 sm:p-5">
          <img
            src={signedUrl}
            alt={alt}
            className="mx-auto max-h-[700px] w-full rounded-xl object-contain"
          />
        </div>

        {caption && (
          <figcaption className="border-t border-gray-200 px-5 py-3 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
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
      <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-5 shadow-sm dark:border-violet-900/60 dark:from-violet-950/30 dark:to-indigo-950/20 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-2xl dark:bg-violet-900/60">
            📎
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-900 dark:text-gray-100">
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

            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400"
            >
              Descarcă fișierul
            </a>
          </div>
        </div>
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