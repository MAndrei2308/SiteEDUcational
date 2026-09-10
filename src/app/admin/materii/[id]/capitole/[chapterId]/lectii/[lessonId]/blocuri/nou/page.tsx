import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createLessonBlock } from "../actions";

type NewLessonBlockPageProps = {
  params: Promise<{
    id: string;
    chapterId: string;
    lessonId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewLessonBlockPage({
  params,
  searchParams,
}: NewLessonBlockPageProps) {
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
    .select("id, title, chapter_id")
    .eq("id", lessonId)
    .eq("chapter_id", chapterId)
    .single();

  if (lessonError || !lesson) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href={`/admin/materii/${id}/capitole/${chapterId}/lectii/${lessonId}/edit`}
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        ← Înapoi la lecție
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-gray-900">
        Adaugă bloc
      </h1>

      <p className="mt-2 text-gray-600">
        Lecție: {lesson.title}
      </p>

      {query.error && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {query.error}
        </div>
      )}

      <form
        action={createLessonBlock.bind(
          null,
          id,
          chapterId,
          lessonId
        )}
        className="mt-8 space-y-6"
      >
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700"
          >
            Tip bloc
          </label>

          <select
            id="type"
            name="type"
            required
            defaultValue="TEXT"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="HEADING">Titlu</option>
            <option value="TEXT">Text</option>
            <option value="CODE">Cod</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="headingText"
            className="block text-sm font-medium text-gray-700"
          >
            Text titlu
          </label>

          <input
            id="headingText"
            name="headingText"
            type="text"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="headingLevel"
            className="block text-sm font-medium text-gray-700"
          >
            Nivel titlu
          </label>

          <select
            id="headingLevel"
            name="headingLevel"
            defaultValue="2"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="2">H2</option>
            <option value="3">H3</option>
            <option value="4">H4</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="text"
            className="block text-sm font-medium text-gray-700"
          >
            Text
          </label>

          <textarea
            id="text"
            name="text"
            rows={6}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-700"
          >
            Limbaj cod
          </label>

          <input
            id="language"
            name="language"
            type="text"
            placeholder="cpp"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700"
          >
            Cod
          </label>

          <textarea
            id="code"
            name="code"
            rows={8}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono"
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
            Bloc activ
          </span>
        </label>

        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white"
        >
          Salvează blocul
        </button>
      </form>
    </main>
  );
}