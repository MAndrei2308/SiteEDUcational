import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteLesson } from "./actions";
import { moveLessonUp } from "./actions";
import { moveLessonDown } from "./actions";

type LessonsPageProps = {
  params: Promise<{
    id: string;
    chapterId: string;
  }>;
};

export default async function LessonsPage({
  params,
}: LessonsPageProps) {
  const { id, chapterId } = await params;

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

  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .select(`
      id,
      title,
      subject_id,
      subjects (
        id,
        name
      )
    `)
    .eq("id", chapterId)
    .eq("subject_id", id)
    .single();

  if (chapterError || !chapter) {
    notFound();
  }

  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("id, title, slug, display_order, is_active")
    .eq("chapter_id", chapterId)
    .order("display_order", { ascending: true });

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <Link
        href={`/admin/materii/${id}/capitole`}
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        ← Înapoi la capitole
      </Link>

      <div className="mt-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Lecții — {chapter.title}
          </h1>

          <p className="mt-2 text-gray-600">
            Gestionează lecțiile acestui capitol.
          </p>
        </div>

        <Link
          href={`/admin/materii/${id}/capitole/${chapterId}/lectii/noua`}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          Adaugă lecție
        </Link>
      </div>

      {error && (
        <p className="mt-8 text-red-600">
          Lecțiile nu au putut fi încărcate.
        </p>
      )}

      {!error && lessons?.length === 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 p-6">
          <p className="text-gray-600">
            Nu există încă nicio lecție.
          </p>
        </div>
      )}

      {!error && lessons && lessons.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                  Lecție
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
              {lessons.map((lesson) => (
                <tr key={lesson.id}>
                  <td className="px-4 py-3 text-gray-900">
                    {lesson.title}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {lesson.slug}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {lesson.is_active ? "Activă" : "Inactivă"}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {lesson.display_order}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                        <Link
                        href={`/admin/materii/${id}/capitole/${chapterId}/lectii/${lesson.id}/edit`}
                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                        Editează
                        </Link>

                        <form
                        action={deleteLesson.bind(
                            null,
                            id,
                            chapterId,
                            lesson.id
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
                          action={moveLessonUp.bind(
                            null,
                            id,
                            chapterId,
                            lesson.id
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
                          action={moveLessonDown.bind(
                            null,
                            id,
                            chapterId,
                            lesson.id
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