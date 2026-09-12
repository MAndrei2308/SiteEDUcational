import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  addBlockToLayout,
  removeBlockFromLayout,
  moveLayoutItemUp,
  moveLayoutItemDown,
  moveLayoutItemToSlot,
} from "../../layout-actions";

type LayoutPageProps = {
  params: Promise<{
    id: string;
    chapterId: string;
    lessonId: string;
    blockId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LayoutPage({
  params,
  searchParams,
}: LayoutPageProps) {
  const { id, chapterId, lessonId, blockId } = await params;
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

  const { data: layoutBlock, error: layoutError } = await supabase
    .from("lesson_blocks")
    .select("id, lesson_id, type, content")
    .eq("id", blockId)
    .eq("lesson_id", lessonId)
    .single();

  if (
    layoutError ||
    !layoutBlock ||
    layoutBlock.type !== "LAYOUT"
  ) {
    notFound();
  }

  const { data: layoutItems, error: layoutItemsError } =
    await supabase
        .from("lesson_layout_items")
        .select(`
        id,
        layout_block_id,
        child_block_id,
        slot,
        display_order,
        child:lesson_blocks!lesson_layout_items_child_block_id_fkey (
            id,
            type,
            content,
            display_order
        )
        `)
      .eq("layout_block_id", blockId)
      .order("display_order", { ascending: true });

  const { data: lessonBlocks, error: blocksError } = await supabase
    .from("lesson_blocks")
    .select("id, type, content, display_order")
    .eq("lesson_id", lessonId)
    .neq("id", blockId)
    .neq("type", "LAYOUT")
    .order("display_order", { ascending: true });

  if (layoutItemsError || blocksError) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-red-600">
          Datele layout-ului nu au putut fi încărcate.
        </p>
      </main>
    );
  }

  const usedBlockIds = new Set(
    (layoutItems ?? []).map(
      (item) => item.child_block_id
    )
  );

  const availableBlocks =
    lessonBlocks?.filter(
      (block) => !usedBlockIds.has(block.id)
    ) ?? [];

  const leftItems =
    layoutItems?.filter(
      (item) => item.slot === "left"
    ) ?? [];

  const rightItems =
    layoutItems?.filter(
      (item) => item.slot === "right"
    ) ?? [];

  const template = String(
    layoutBlock.content?.template ?? "two-columns-50-50"
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <Link
        href={`/admin/materii/${id}/capitole/${chapterId}/lectii/${lessonId}/edit`}
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        ← Înapoi la lecție
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Configurează layout
        </h1>

        <p className="mt-2 text-gray-600">
          Template: {template}
        </p>
      </div>

      {query.error && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {query.error}
        </div>
      )}

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section className="rounded-xl border border-gray-200 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Coloana stângă
          </h2>

          {leftItems.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              Nu există blocuri în coloana stângă.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {leftItems.map((item) => {
                const child = Array.isArray(item.child)
                    ? item.child[0]
                    : item.child;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {child?.type ?? "Bloc"}
                      </p>

                      <p className="text-xs text-gray-500">
                        Ordine: {item.display_order}
                      </p>
                    </div>

                    <form
                      action={removeBlockFromLayout.bind(
                        null,
                        id,
                        chapterId,
                        lessonId,
                        blockId,
                        item.child_block_id
                      )}
                    >
                      <button
                        type="submit"
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Elimină
                      </button>
                    </form>

                    <form
                      action={moveLayoutItemUp.bind(
                        null,
                        id,
                        chapterId,
                        lessonId,
                        blockId,
                        item.child_block_id,
                        "left"
                      )}
                    >
                      <button type="submit">↑</button>
                    </form>

                    <form
                      action={moveLayoutItemDown.bind(
                        null,
                        id,
                        chapterId,
                        lessonId,
                        blockId,
                        item.child_block_id,
                        "left"
                      )}
                    >
                      <button type="submit">↓</button>
                    </form>

                    <form
                      action={moveLayoutItemToSlot.bind(
                        null,
                        id,
                        chapterId,
                        lessonId,
                        blockId,
                        item.child_block_id,
                        "right"
                      )}
                    >
                      <button type="submit">→ Dreapta</button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Coloana dreaptă
          </h2>

          {rightItems.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              Nu există blocuri în coloana dreaptă.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {rightItems.map((item) => {
                const child = Array.isArray(item.child)
                    ? item.child[0]
                    : item.child;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {child?.type ?? "Bloc"}
                      </p>

                      <p className="text-xs text-gray-500">
                        Ordine: {item.display_order}
                      </p>
                    </div>

                    <form
                      action={removeBlockFromLayout.bind(
                        null,
                        id,
                        chapterId,
                        lessonId,
                        blockId,
                        item.child_block_id
                      )}
                    >
                      <button
                        type="submit"
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Elimină
                      </button>
                    </form>

                    <form
                      action={moveLayoutItemUp.bind(
                        null,
                        id,
                        chapterId,
                        lessonId,
                        blockId,
                        item.child_block_id,
                        "right"
                      )}
                    >
                      <button type="submit">↑</button>
                    </form>

                    <form
                      action={moveLayoutItemDown.bind(
                        null,
                        id,
                        chapterId,
                        lessonId,
                        blockId,
                        item.child_block_id,
                        "right"
                      )}
                    >
                      <button type="submit">↓</button>
                    </form>

                    <form
                      action={moveLayoutItemToSlot.bind(
                        null,
                        id,
                        chapterId,
                        lessonId,
                        blockId,
                        item.child_block_id,
                        "left"
                      )}
                    >
                      <button type="submit">← Stânga</button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-gray-900">
          Blocuri disponibile
        </h2>

        <p className="mt-2 text-gray-600">
          Alege blocurile pe care vrei să le introduci în layout.
        </p>

        {availableBlocks.length === 0 ? (
          <div className="mt-6 rounded-xl border border-gray-200 p-6">
            <p className="text-gray-600">
              Nu mai există blocuri disponibile.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {availableBlocks.map((block) => (
              <div
                key={block.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {block.type}
                  </p>

                  <p className="text-sm text-gray-500">
                    Ordine în lecție: {block.display_order}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <form
                    action={addBlockToLayout.bind(
                      null,
                      id,
                      chapterId,
                      lessonId,
                      blockId,
                      block.id,
                      "left"
                    )}
                  >
                    <button
                      type="submit"
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Adaugă în stânga
                    </button>
                  </form>

                  <form
                    action={addBlockToLayout.bind(
                      null,
                      id,
                      chapterId,
                      lessonId,
                      blockId,
                      block.id,
                      "right"
                    )}
                  >
                    <button
                      type="submit"
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Adaugă în dreapta
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}