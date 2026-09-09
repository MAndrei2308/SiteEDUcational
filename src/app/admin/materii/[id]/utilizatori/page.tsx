import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import {
  approveEnrollment,
  rejectEnrollment,
  revokeEnrollment,
  deleteEnrollment,
} from "./actions";

type SubjectUsersPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SubjectUsersPage({
  params,
}: SubjectUsersPageProps) {
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

  const { data: enrollments, error } = await supabase
    .from("enrollments")
    .select(`
      id,
      status,
      created_at,
      profiles (
        full_name
      )
    `)
    .eq("subject_id", id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <Link
        href="/admin/materii"
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        ← Înapoi la materii
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-gray-900">
        Utilizatori — {subject.name}
      </h1>

      <p className="mt-2 text-gray-600">
        Gestionează utilizatorii înscriși la această materie.
      </p>

      {error && (
        <p className="mt-8 text-red-600">
          Utilizatorii nu au putut fi încărcați.
        </p>
      )}

      {!error && enrollments?.length === 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 p-6">
          <p className="text-gray-600">
            Nu există utilizatori înscriși la această materie.
          </p>
        </div>
      )}

      {!error && enrollments && enrollments.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                  Utilizator
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                  Data înscrierii
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                  Acțiuni
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {enrollments.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td className="px-4 py-3 text-gray-900">
                    {enrollment.profiles?.full_name || "Utilizator"}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {enrollment.status}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {new Date(enrollment.created_at).toLocaleDateString("ro-RO")}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3">
                        {enrollment.status !== "APPROVED" && (
                        <form
                            action={approveEnrollment.bind(
                            null,
                            enrollment.id,
                            subject.id
                            )}
                        >
                            <button
                            type="submit"
                            className="text-sm font-medium text-green-700 hover:text-green-800"
                            >
                            Aprobă
                            </button>
                        </form>
                        )}

                        {enrollment.status === "PENDING" && (
                        <form
                            action={rejectEnrollment.bind(
                            null,
                            enrollment.id,
                            subject.id
                            )}
                        >
                            <button
                            type="submit"
                            className="text-sm font-medium text-gray-700 hover:text-gray-900"
                            >
                            Respinge
                            </button>
                        </form>
                        )}

                        {enrollment.status === "APPROVED" && (
                        <form
                            action={revokeEnrollment.bind(
                            null,
                            enrollment.id,
                            subject.id
                            )}
                        >
                            <button
                            type="submit"
                            className="text-sm font-medium text-orange-700 hover:text-orange-800"
                            >
                            Revocă accesul
                            </button>
                        </form>
                        )}

                        <form
                        action={deleteEnrollment.bind(
                            null,
                            enrollment.id,
                            subject.id
                        )}
                        >
                        <button
                            type="submit"
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                        >
                            Șterge
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