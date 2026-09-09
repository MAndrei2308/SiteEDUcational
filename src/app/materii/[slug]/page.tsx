import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requestEnrollment } from "./actions";

type SubjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function SubjectPage({
  params,
}: SubjectPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (subjectError || !subject) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: string | null = null;
  let enrollmentStatus: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    userRole = profile?.role ?? null;

    if (userRole !== "ADMIN") {
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("status")
        .eq("user_id", user.id)
        .eq("subject_id", subject.id)
        .maybeSingle();

      enrollmentStatus = enrollment?.status ?? null;
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900">
        {subject.name}
      </h1>

      {subject.description && (
        <p className="mt-4 text-gray-600">
          {subject.description}
        </p>
      )}

      <div className="mt-10 rounded-xl border border-gray-200 p-6">

        {!user && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Autentificare necesară
            </h2>

            <p className="mt-2 text-gray-600">
              Trebuie să fii autentificat pentru a solicita acces la această
              materie.
            </p>
          </div>
        )}

        {user && userRole === "ADMIN" && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Acces administrator
            </h2>

            <p className="mt-2 text-gray-600">
              Ai acces complet la această materie.
            </p>
          </div>
        )}

        {user &&
          userRole !== "ADMIN" &&
          !enrollmentStatus && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Nu ești înscris
              </h2>

              <p className="mt-2 text-gray-600">
                Poți solicita acces la această materie.
              </p>

              <form
                action={requestEnrollment.bind(
                  null,
                  subject.id,
                  subject.slug
                )}
                className="mt-6"
              >
                <button
                  type="submit"
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                >
                  Solicită acces
                </button>
              </form>
            </div>
          )}

        {user &&
          userRole !== "ADMIN" &&
          enrollmentStatus === "PENDING" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Cerere în așteptare
              </h2>

              <p className="mt-2 text-gray-600">
                Cererea ta de acces trebuie aprobată de profesor.
              </p>
            </div>
          )}

        {user &&
          userRole !== "ADMIN" &&
          enrollmentStatus === "REJECTED" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Cerere respinsă
              </h2>

              <p className="mt-2 text-gray-600">
                Cererea ta de acces a fost respinsă.
              </p>
            </div>
          )}

        {user &&
          userRole !== "ADMIN" &&
          enrollmentStatus === "APPROVED" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Acces aprobat
              </h2>

              <p className="mt-2 text-gray-600">
                Ai acces la conținutul acestei materii.
              </p>

              <div className="mt-6 rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">
                  Capitolele și lecțiile vor fi afișate aici.
                </p>
              </div>
            </div>
          )}
      </div>
    </main>
  );
}