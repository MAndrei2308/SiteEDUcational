import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function SubjectsPage() {
  const supabase = await createClient();

  const { data: subjects, error } = await supabase
    .from("subjects")
    .select("id, name, slug, description, image_url, display_order")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900">Materii</h1>

        <p className="mt-4 text-gray-600">
          Explorează materiile disponibile în platformă.
        </p>
      </div>

      {error && (
        <div className="mt-8 rounded-lg bg-red-50 px-4 py-3 text-red-700">
          Materiile nu au putut fi încărcate.
        </div>
      )}

      {!error && subjects?.length === 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 p-6">
          <p className="text-gray-600">
            Nu există momentan materii disponibile.
          </p>
        </div>
      )}

      {!error && subjects && subjects.length > 0 && (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/materii/${subject.slug}`}
              className="block rounded-xl border border-gray-200 bg-white p-6 transition hover:border-gray-300 hover:shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                {subject.name}
              </h2>

              {subject.description && (
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {subject.description}
                </p>
              )}

              <p className="mt-4 text-sm font-medium text-gray-900">
                Vezi materia →
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}