import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateSubject } from "@/app/admin/materii/actions";

type EditSubjectPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditSubjectPage({
  params,
  searchParams,
}: EditSubjectPageProps) {
  const { id } = await params;
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

  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select(
      "id, name, slug, description, display_order, is_active"
    )
    .eq("id", id)
    .single();

  if (subjectError || !subject) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/admin/materii"
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        ← Înapoi la materii
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-gray-900">
        Editează materia
      </h1>

      {query.error && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {query.error}
        </div>
      )}

      <form
        action={updateSubject.bind(null, subject.id)}
        className="mt-8 space-y-6"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nume
          </label>

          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={subject.name}
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
            defaultValue={subject.slug}
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
            defaultValue={subject.description ?? ""}
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
            defaultValue={subject.display_order}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <label className="flex items-center gap-3">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={subject.is_active}
            className="h-4 w-4"
          />

          <span className="text-sm font-medium text-gray-700">
            Materie activă
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