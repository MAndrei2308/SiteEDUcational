import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteChapter } from "./actions";
import { moveChapterUp } from "./actions";
import { moveChapterDown } from "./actions";

type ChaptersPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ChaptersPage({
  params,
}: ChaptersPageProps) {
  const { id } = await params;

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

  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("id", id)
    .single();

  if (subjectError || !subject) {
    notFound();
  }

  const { data: chapters, error } = await supabase
    .from("chapters")
    .select("id, title, slug, display_order, is_active")
    .eq("subject_id", id)
    .order("display_order", { ascending: true });

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <Link
        href="/admin/materii"
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        ← Înapoi la materii
      </Link>

      <div className="mt-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Capitole — {subject.name}
          </h1>

          <p className="mt-2 text-gray-600">
            Gestionează capitolele acestei materii.
          </p>
        </div>

        <Link
          href={`/admin/materii/${subject.id}/capitole/nou`}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          Adaugă capitol
        </Link>
      </div>

      {error && (
        <p className="mt-8 text-red-600">
          Capitolele nu au putut fi încărcate.
        </p>
      )}

      {!error && chapters?.length === 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 p-6">
          <p className="text-gray-600">
            Nu există încă niciun capitol.
          </p>
        </div>
      )}

      {!error && chapters && chapters.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                  Capitol
                </th>

                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                  Slug
                </th>

                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                  Status
                </th>

                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                  Ordine
                </th>

                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                  Acțiuni
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {chapters.map((chapter) => (
                <tr key={chapter.id}>
                  <td className="px-4 py-3 text-gray-900">
                    {chapter.title}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {chapter.slug}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {chapter.is_active ? "Activ" : "Inactiv"}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {chapter.display_order}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                        <Link
                          href={`/admin/materii/${subject.id}/capitole/${chapter.id}/edit`}
                          className="text-sm font-medium text-gray-700 hover:text-gray-900"
                          >
                          Editează
                        </Link>

                        <Link
                          href={`/admin/materii/${subject.id}/capitole/${chapter.id}/lectii`}
                          className="text-sm font-medium text-gray-700 hover:text-gray-900"
                          >
                          Lecții
                        </Link>

                        <form action={deleteChapter.bind(null, subject.id, chapter.id)}>
                        <button
                            type="submit"
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                        >
                            Șterge
                        </button>
                        </form>

                        <form
                          action={moveChapterUp.bind(
                            null,
                            id,
                            chapter.id
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
                          action={moveChapterDown.bind(
                            null,
                            id,
                            chapter.id
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
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}