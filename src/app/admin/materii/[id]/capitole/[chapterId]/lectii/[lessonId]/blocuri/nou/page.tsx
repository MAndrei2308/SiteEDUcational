import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createLessonBlock } from "../actions";
import LessonBlockForm from "@/components/lesson/LessonBlockForm";

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

      <LessonBlockForm
        action={createLessonBlock.bind(
            null,
            id,
            chapterId,
            lessonId
        )}
        />
    </main>
  );
}