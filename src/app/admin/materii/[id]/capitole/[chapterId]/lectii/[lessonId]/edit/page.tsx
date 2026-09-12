import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateLesson } from "../../actions";
import { deleteLessonBlock } from "../blocuri/actions";
import LessonBlockRenderer from "@/components/lesson/LessonBlockRenderer";
import { moveLessonBlockUp } from "../blocuri/actions";
import { moveLessonBlockDown } from "../blocuri/actions";

type EditLessonPageProps = {
  params: Promise<{
    id: string;
    chapterId: string;
    lessonId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditLessonPage({
  params,
  searchParams,
}: EditLessonPageProps) {
  const { id, chapterId, lessonId } = await params;
  const query = await searchParams;

  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const userId = claimsData.claims.sub;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select(
      "id, title, slug, summary, display_order, is_active, chapter_id"
    )
    .eq("id", lessonId)
    .eq("chapter_id", chapterId)
    .single();

  const { data: blocks, error: blocksError } = await supabase
    .from("lesson_blocks")
    .select("id, type, content, display_order, is_active")
    .eq("lesson_id", lessonId)
    .order("display_order", { ascending: true });

  const { data: layoutItems, error: layoutItemsError } = await supabase
    .from("lesson_layout_items")
    .select(`
      id,
      layout_block_id,
      child_block_id,
      slot,
      display_order
    `)
    .order("display_order", { ascending: true });

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
    const childBlock = blocksWithSignedUrls.find(
      (block) => block.id === item.child_block_id
    );

    if (!childBlock) {
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
      layout.left.push(childBlock);
    }

    if (item.slot === "right") {
      layout.right.push(childBlock);
    }
  }

  console.log("SUBJECT ID:", id);
  console.log("CHAPTER ID:", chapterId);
  console.log("LESSON ID:", lessonId);
  console.log("LESSON:", lesson);
  console.log("LESSON ERROR:", lessonError);

  if (lessonError || !lesson) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href={`/admin/materii/${id}/capitole/${chapterId}/lectii`}
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        ← Înapoi la lecții
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-gray-900">
        Editează lecția
      </h1>

      {query.error && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {query.error}
        </div>
      )}

      <form
        action={updateLesson.bind(null, id, chapterId, lesson.id)}
        className="mt-8 space-y-6"
      >
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Titlu
          </label>

          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={lesson.title}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-gray-700"
          >
            Slug
          </label>

          <input
            id="slug"
            name="slug"
            type="text"
            required
            defaultValue={lesson.slug}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="summary"
            className="block text-sm font-medium text-gray-700"
          >
            Rezumat
          </label>

          <textarea
            id="summary"
            name="summary"
            rows={4}
            defaultValue={lesson.summary ?? ""}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="displayOrder"
            className="block text-sm font-medium text-gray-700"
          >
            Ordine afișare
          </label>

          <input
            id="displayOrder"
            name="displayOrder"
            type="number"
            min="1"
            defaultValue={lesson.display_order}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />

          <p className="mt-1 text-xs text-gray-500">
            Dacă poziția este deja ocupată, celelalte lecții vor fi reordonate automat.
          </p>
        </div>

        <label className="flex items-center gap-3">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={lesson.is_active}
            className="h-4 w-4"
          />

          <span className="text-sm font-medium text-gray-700">
            Lecție activă
          </span>
        </label>

        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white"
        >
          Salvează modificările
        </button>
      </form>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Conținutul lecției
            </h2>

            <p className="mt-2 text-gray-600">
              Construiește lecția folosind blocuri de conținut.
            </p>
          </div>

          <Link
            href={`/admin/materii/${id}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou`}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
          >
            Adaugă bloc
          </Link>
        </div>

        {blocksError && (
          <p className="mt-6 text-red-600">
            Blocurile nu au putut fi încărcate.
          </p>
        )}

        {!blocksError && blocksWithSignedUrls.length === 0 && (
          <div className="mt-6 rounded-xl border border-gray-200 p-6">
            <p className="text-gray-600">
              Lecția nu are încă niciun bloc de conținut.
            </p>
          </div>
        )}

        {!blocksError && blocksWithSignedUrls.length > 0 && (
          <div className="mt-6 space-y-4">
            {topLevelBlocks.map((block) => (
              <div
                key={block.id}
                className="rounded-xl border border-gray-200 p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {block.type}
                    </span>

                    <span className="text-xs text-gray-400">
                      Ordine: {block.display_order}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/materii/${id}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${block.id}/edit`}
                      className="text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Editează
                    </Link>

                    {block.type === "LAYOUT" && (
                      <Link
                        href={`/admin/materii/${id}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${block.id}/layout`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Configurează layout
                      </Link>
                    )}

                    <form
                      action={deleteLessonBlock.bind(
                        null,
                        id,
                        chapterId,
                        lessonId,
                        block.id
                      )}
                    >
                      <button
                        type="submit"
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Șterge
                      </button>
                    </form>

                    <form
                      action={moveLessonBlockUp.bind(
                        null,
                        id,
                        chapterId,
                        lessonId,
                        block.id
                      )}
                    >
                      <button
                        type="submit"
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        ↑ Sus
                      </button>
                    </form>

                    <form
                      action={moveLessonBlockDown.bind(
                        null,
                        id,
                        chapterId,
                        lessonId,
                        block.id
                      )}
                    >
                      <button
                        type="submit"
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        ↓ Jos
                      </button>
                    </form>
                  </div>
                </div>

                <div className="mt-4">
                  <LessonBlockRenderer
                    block={block}
                    layoutChildren={
                      block.type === "LAYOUT"
                        ? layoutChildrenMap.get(block.id)
                        : undefined
                    }
                  />
                </div>
              </div>
))}
          </div>
        )}
      </section>
    </main>
  );
}