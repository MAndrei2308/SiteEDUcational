import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DeleteSubjectButton from "@/components/admin/DeleteSubjectButton";
import { deleteSubject } from "./actions";
import { moveSubjectUp } from "./actions";
import { moveSubjectDown } from "./actions";

export default async function AdminSubjectsPage() {
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

  const { data: subjects, error } = await supabase
    .from("subjects")
    .select("id, name, slug, is_active, display_order")
    .order("display_order", { ascending: true });

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Administrare materii
          </h1>

          <p className="mt-2 text-gray-600">
            Gestionează materiile disponibile în platformă.
          </p>
        </div>

        <Link
          href="/admin/materii/noua"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          Adaugă materie
        </Link>
      </div>

      {error && (
        <p className="mt-8 text-red-600">
          Materiile nu au putut fi încărcate.
        </p>
      )}

      {!error && subjects?.length === 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 p-6">
          <p className="text-gray-600">
            Nu există încă nicio materie.
          </p>
        </div>
      )}

      {!error && subjects && subjects.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                  Materie
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
              {subjects.map((subject) => (
                <tr key={subject.id}>
                  <td className="px-4 py-3 text-gray-900">
                    {subject.name}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {subject.slug}
                  </td>

                  <td className="px-4 py-3">
                    {subject.is_active ? "Activă" : "Inactivă"}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {subject.display_order}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/materii/${subject.id}/edit`}
                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        Editează
                      </Link>

                      <Link
                        href={`/admin/materii/${subject.id}/utilizatori`}
                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        Utilizatori
                      </Link>

                      <Link
                        href={`/admin/materii/${subject.id}/capitole`}
                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        Capitole
                      </Link>

                      <DeleteSubjectButton
                        subjectId={subject.id}
                        subjectName={subject.name}
                        deleteAction={deleteSubject}
                      />

                      <form action={moveSubjectUp.bind(null, subject.id)}>
                        <button
                          type="submit"
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          ↑ Sus
                        </button>
                      </form>

                      <form action={moveSubjectDown.bind(null, subject.id)}>
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