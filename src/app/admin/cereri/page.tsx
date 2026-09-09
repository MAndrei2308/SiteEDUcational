import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { approveEnrollment, rejectEnrollment } from "./actions";

export default async function AdminRequestsPage() {
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

  const { data: enrollments, error } = await supabase
    .from("enrollments")
    .select(`
      id,
      status,
      created_at,
      profiles (
        full_name
      ),
      subjects (
        name
      )
    `)
    .eq("status", "PENDING")
    .order("created_at", { ascending: true });

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900">
        Cereri de acces
      </h1>

      <p className="mt-2 text-gray-600">
        Aprobă sau respinge cererile elevilor.
      </p>

      {error && (
        <p className="mt-8 text-red-600">
          Cererile nu au putut fi încărcate.
        </p>
      )}

      {!error && enrollments?.length === 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 p-6">
          <p className="text-gray-600">
            Nu există cereri în așteptare.
          </p>
        </div>
      )}

      {!error && enrollments && enrollments.length > 0 && (
        <div className="mt-8 space-y-4">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 p-6"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {enrollment.profiles?.full_name || "Elev"}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Materie: {enrollment.subjects?.name || "Necunoscută"}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {new Date(enrollment.created_at).toLocaleDateString("ro-RO")}
                </p>
              </div>

              <div className="flex gap-3">
                <form action={approveEnrollment.bind(null, enrollment.id)}>
                  <button
                    type="submit"
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
                  >
                    Aprobă
                  </button>
                </form>

                <form action={rejectEnrollment.bind(null, enrollment.id)}>
                  <button
                    type="submit"
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                  >
                    Respinge
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}