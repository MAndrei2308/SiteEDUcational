import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LessonBlockForm from "@/components/lesson/LessonBlockForm";
import { updateLessonBlock } from "../../actions"

type EditLessonBlockPageProps = {
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

export default async function EditLessonBlockPage({
  params,
  searchParams,
}: EditLessonBlockPageProps) {
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

  const { data: block, error: blockError } = await supabase
    .from("lesson_blocks")
    .select("id, lesson_id, type, content, display_order, is_active")
    .eq("id", blockId)
    .eq("lesson_id", lessonId)
    .single();

  if (blockError || !block) {
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
        Editează blocul
      </h1>

      {query.error && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {query.error}
        </div>
      )}

      <LessonBlockForm
        action={updateLessonBlock.bind(
          null,
          id,
          chapterId,
          lessonId,
          block.id
        )}
        initialType={block.type}
        initialContent={block.content}
        initialDisplayOrder={block.display_order}
        initialIsActive={block.is_active}
        submitLabel="Salvează modificările"
      />
    </main>
  );
}