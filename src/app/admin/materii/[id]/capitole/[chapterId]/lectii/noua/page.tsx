import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createLesson } from "../actions";

type NewLessonPageProps = {
  params: Promise<{
    id: string;
    chapterId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewLessonPage({
  params,
  searchParams,
}: NewLessonPageProps) {
  const { id, chapterId } = await params;
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

  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .select("id, title, subject_id")
    .eq("id", chapterId)
    .eq("subject_id", id)
    .single();

  if (chapterError || !chapter) {
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
        Adaugă lecție
      </h1>

      <p className="mt-2 text-gray-600">
        Capitol: {chapter.title}
      </p>

      {query.error && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {query.error}
        </div>
      )}

      <form
        action={createLesson.bind(null, id, chapterId)}
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
            placeholder="notiuni-de-baza"
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
            min="0"
            defaultValue="0"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <label className="flex items-center gap-3">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked
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
          Salvează lecția
        </button>
      </form>
    </main>
  );
}