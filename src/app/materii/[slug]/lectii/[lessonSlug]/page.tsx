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
  const decodedLessonSlug = decodeURIComponent(lessonSlug);

  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login");
  }

  const { data: subject } = await supabase
    .from("subjects")
    .select("id, name, slug")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!subject) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "ADMIN";

  if (!isAdmin) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("status")
      .eq("user_id", user.id)
      .eq("subject_id", subject.id)
      .eq("status", "APPROVED")
      .maybeSingle();

    if (!enrollment) {
      redirect(`/materii/${slug}`);
    }
  }

  const { data: lesson, error: lessonError } = await supabase
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
    .eq("chapters.subject_id", subject.id)
    .single();

  // console.log("SUBJECT:", subject);
  // console.log("LESSON SLUG:", lessonSlug);
  // console.log("LESSON:", lesson);
  // console.log("LESSON ERROR:", lessonError);

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("status, started_at, completed_at")
    .eq("user_id", user.id)
    .eq("lesson_id", lesson!.id)
    .maybeSingle();

  if (lessonError || !lesson) {
    notFound();
  }

  if (!isAdmin && !progress) {
    await startLessonProgress(lesson.id);
  }

  const { data: blocks, error: blocksError } = await supabase
    .from("lesson_blocks")
    .select("id, type, content, display_order, is_active")
    .eq("lesson_id", lesson.id)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (blocksError) {
    throw new Error("Blocurile lecției nu au putut fi încărcate.");
  }

  const blocksWithSignedUrls = await Promise.all(
    (blocks ?? []).map(async (block) => {
      if (block.type !== "IMAGE" && block.type !== "FILE") {
        return block;
      }

      const path = String(block.content?.path ?? "");

      if (!path) {
        return block;
      }

      const bucket =
        block.type === "IMAGE"
          ? "lesson-images"
          : "lesson-files";

      const { data: signedData } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 60);

      return {
        ...block,
        content: {
          ...block.content,
          signedUrl: signedData?.signedUrl ?? null,
        },
      };
    })
  );

  const { data: layoutItems } = await supabase
    .from("lesson_layout_items")
    .select(`
      layout_block_id,
      child_block_id,
      slot,
      display_order
    `)
    .order("display_order", { ascending: true });

  const childBlockIds = new Set(
    (layoutItems ?? []).map((item) => item.child_block_id)
  );

  const topLevelBlocks = blocksWithSignedUrls.filter(
    (block) => !childBlockIds.has(block.id)
  );

  const layoutChildrenMap = new Map<
    string,
    {
      left: typeof blocksWithSignedUrls;
      right: typeof blocksWithSignedUrls;
    }
  >();

  for (const item of layoutItems ?? []) {
    const child = blocksWithSignedUrls.find(
      (block) => block.id === item.child_block_id
    );

    if (!child) {
      continue;
    }

    if (!layoutChildrenMap.has(item.layout_block_id)) {
      layoutChildrenMap.set(item.layout_block_id, {
        left: [],
        right: [],
      });
    }

    const layout = layoutChildrenMap.get(item.layout_block_id)!;

    if (item.slot === "left") {
      layout.left.push(child);
    }

    if (item.slot === "right") {
      layout.right.push(child);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Link
        href={`/materii/${slug}`}
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        ← Înapoi la {subject.name}
      </Link>

      <header className="mt-8">
        <p className="text-sm font-medium text-gray-500">
          Lecție
        </p>

        <h1 className="mt-2 text-4xl font-bold text-gray-900">
          {lesson.title}
        </h1>

        {lesson.summary && (
          <p className="mt-4 text-lg leading-8 text-gray-600">
            {lesson.summary}
          </p>
        )}
      </header>

      <div className="mt-12 space-y-8">
        {topLevelBlocks.map((block) => (
          <LessonBlockRenderer
            key={block.id}
            block={block}
            layoutChildren={
              block.type === "LAYOUT"
                ? layoutChildrenMap.get(block.id)
                : undefined
            }
          />
        ))}
      </div>

      {!isAdmin && (
        <div className="mt-12 border-t border-gray-200 pt-8">
          {progress?.status === "COMPLETED" ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
              <p className="font-medium text-green-800">
                Lecție finalizată
              </p>

              <p className="mt-1 text-sm text-green-700">
                Ai finalizat această lecție.
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
                className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-700"
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