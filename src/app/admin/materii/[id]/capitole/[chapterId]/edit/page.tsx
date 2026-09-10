import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateChapter } from "../../actions";

type EditChapterPageProps = {
  params: Promise<{
    id: string;
    chapterId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditChapterPage({
  params,
  searchParams,
}: EditChapterPageProps) {
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
    .select(
      "id, title, slug, description, display_order, is_active, subject_id"
    )
    .eq("id", chapterId)
    .eq("subject_id", id)
    .single();

  if (chapterError || !chapter) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href={`/admin/materii/${id}/capitole`}
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        ← Înapoi la capitole
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-gray-900">
        Editează capitolul
      </h1>

      {query.error && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {query.error}
        </div>
      )}

      <form
        action={updateChapter.bind(null, id, chapter.id)}
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
            defaultValue={chapter.title}
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
            defaultValue={chapter.slug}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Descriere
          </label>

          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={chapter.description ?? ""}
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
            defaultValue={chapter.display_order}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />

          <p className="mt-1 text-xs text-gray-500">
            Dacă poziția este ocupată, celelalte capitole vor fi reordonate automat.
          </p>
        </div>

        <label className="flex items-center gap-3">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={chapter.is_active}
            className="h-4 w-4"
          />

          <span className="text-sm font-medium text-gray-700">
            Capitol activ
          </span>
        </label>

        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white"
        >
          Salvează modificările
        </button>
      </form>
    </main>
  );
}