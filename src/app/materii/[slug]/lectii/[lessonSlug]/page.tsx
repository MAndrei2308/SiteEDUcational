import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LessonBlockRenderer from "@/components/lesson/LessonBlockRenderer";

import {
  startLessonProgress,
  completeLesson,
} from "./actions";

type LessonPageProps = {
  params: Promise<{
    slug: string;
    lessonSlug: string;
  }>;
};

export default async function LessonPage({
  params,
}: LessonPageProps) {
  const { slug, lessonSlug } = await params;

  const decodedLessonSlug =
    decodeURIComponent(lessonSlug);

  const supabase = await createClient();

  // -------------------------------------------------------
  // Utilizator
  // -------------------------------------------------------

  const { data: userData } =
    await supabase.auth.getUser();

  const user = userData.user;

  if (!user) {
    redirect("/login");
  }

  // -------------------------------------------------------
  // Materie
  // -------------------------------------------------------

  const { data: subject } = await supabase
    .from("subjects")
    .select("id, name, slug")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!subject) {
    notFound();
  }

  // -------------------------------------------------------
  // Rol utilizator
  // -------------------------------------------------------

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin =
    profile?.role === "ADMIN";

  // -------------------------------------------------------
  // Verificare acces elev
  // -------------------------------------------------------

  if (!isAdmin) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("status")
      .eq("user_id", user.id)
      .eq("subject_id", subject.id)
      .eq("status", "APPROVED")
      .maybeSingle();

    if (!enrollment) {
      redirect(`/materii/${subject.slug}`);
    }
  }

  // -------------------------------------------------------
  // Lecție
  // -------------------------------------------------------

  const {
    data: lesson,
    error: lessonError,
  } = await supabase
    .from("lessons")
    .select(`
      id,
      title,
      slug,
      summary,
      chapter_id,
      chapters!inner (
        id,
        title,
        subject_id
      )
    `)
    .eq("slug", decodedLessonSlug)
    .eq("is_active", true)
    .eq(
      "chapters.subject_id",
      subject.id
    )
    .single();

  if (lessonError || !lesson) {
    notFound();
  }

  // -------------------------------------------------------
  // Progres
  // -------------------------------------------------------

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select(
      "status, started_at, completed_at"
    )
    .eq("user_id", user.id)
    .eq("lesson_id", lesson.id)
    .maybeSingle();

  if (!isAdmin && !progress) {
    await startLessonProgress(lesson.id);
  }

  // -------------------------------------------------------
  // Blocurile lecției
  // -------------------------------------------------------

  const {
    data: blocks,
    error: blocksError,
  } = await supabase
    .from("lesson_blocks")
    .select(
      "id, type, content, display_order, is_active"
    )
    .eq("lesson_id", lesson.id)
    .eq("is_active", true)
    .order("display_order", {
      ascending: true,
    });

  if (blocksError) {
    throw new Error(
      "Blocurile lecției nu au putut fi încărcate."
    );
  }

  // -------------------------------------------------------
  // Signed URLs pentru IMAGE și FILE
  // -------------------------------------------------------

  const blocksWithSignedUrls =
    await Promise.all(
      (blocks ?? []).map(async (block) => {
        if (
          block.type !== "IMAGE" &&
          block.type !== "FILE"
        ) {
          return block;
        }

        const path = String(
          block.content?.path ?? ""
        );

        if (!path) {
          return block;
        }

        const bucket =
          block.type === "IMAGE"
            ? "lesson-images"
            : "lesson-files";

        const { data: signedData } =
          await supabase.storage
            .from(bucket)
            .createSignedUrl(
              path,
              60 * 60
            );

        return {
          ...block,
          content: {
            ...block.content,
            signedUrl:
              signedData?.signedUrl ??
              null,
          },
        };
      })
    );

  // -------------------------------------------------------
  // Layout-uri
  // -------------------------------------------------------

  const { data: layoutItems } =
    await supabase
      .from("lesson_layout_items")
      .select(`
        layout_block_id,
        child_block_id,
        slot,
        display_order
      `)
      .order("display_order", {
        ascending: true,
      });

  const childBlockIds = new Set(
    (layoutItems ?? []).map(
      (item) => item.child_block_id
    )
  );

  const topLevelBlocks =
    blocksWithSignedUrls.filter(
      (block) =>
        !childBlockIds.has(block.id)
    );

  const layoutChildrenMap = new Map<
    string,
    {
      left: typeof blocksWithSignedUrls;
      right: typeof blocksWithSignedUrls;
    }
  >();

  for (const item of layoutItems ?? []) {
    const child =
      blocksWithSignedUrls.find(
        (block) =>
          block.id ===
          item.child_block_id
      );

    if (!child) {
      continue;
    }

    if (
      !layoutChildrenMap.has(
        item.layout_block_id
      )
    ) {
      layoutChildrenMap.set(
        item.layout_block_id,
        {
          left: [],
          right: [],
        }
      );
    }

    const layout =
      layoutChildrenMap.get(
        item.layout_block_id
      )!;

    if (item.slot === "left") {
      layout.left.push(child);
    }

    if (item.slot === "right") {
      layout.right.push(child);
    }
  }

  // -------------------------------------------------------
  // Tipurile care pot folosi mai multă lățime
  // -------------------------------------------------------

  const wideBlockTypes = new Set([
    "LAYOUT",
    "DIAGRAM",
    "VIDEO",
    "CODE",
    "IMAGE",
    "FILE",
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-16">
      {/* Header lecție */}
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/materii/${subject.slug}`}
          className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          ← Înapoi la {subject.name}
        </Link>

        <header className="mt-6 sm:mt-8">
          <p className="text-sm font-medium text-gray-500">
            Lecție
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {lesson.title}
          </h1>

          {lesson.summary && (
            <p className="mt-4 text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
              {lesson.summary}
            </p>
          )}
        </header>
      </div>

      {/* Conținut lecție */}
      <div className="mt-10 space-y-8 sm:mt-12 sm:space-y-10">
        {topLevelBlocks.map(
          (block) => {
            const isWide =
              wideBlockTypes.has(
                block.type
              );

            return (
              <div
                key={block.id}
                className={
                  isWide
                    ? "mx-auto w-full max-w-6xl"
                    : "mx-auto w-full max-w-4xl"
                }
              >
                <LessonBlockRenderer
                  block={block}
                  layoutChildren={
                    block.type ===
                    "LAYOUT"
                      ? layoutChildrenMap.get(
                          block.id
                        )
                      : undefined
                  }
                />
              </div>
            );
          }
        )}
      </div>

      {/* Finalizare lecție */}
      {!isAdmin && (
        <div className="mx-auto mt-12 max-w-4xl border-t border-gray-200 pt-8 sm:mt-16">
          {progress?.status ===
          "COMPLETED" ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-5 sm:p-6">
              <p className="font-medium text-green-800">
                Lecție finalizată
              </p>

              <p className="mt-1 text-sm text-green-700">
                Ai finalizat această
                lecție.
              </p>
            </div>
          ) : (
            <form
              action={completeLesson.bind(
                null,
                lesson.id,
                subject.slug,
                lesson.slug
              )}
            >
              <button
                type="submit"
                className="w-full rounded-lg bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-gray-700 sm:w-auto"
              >
                Finalizează lecția
              </button>
            </form>
          )}
        </div>
      )}
    </main>
  );
}