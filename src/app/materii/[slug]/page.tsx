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
  let hasAccess = false;

  let chapters:
    | {
        id: string;
        title: string;
        slug: string;
        description: string | null;
        display_order: number;
        lessons: {
          id: string;
          title: string;
          slug: string;
          summary: string | null;
          display_order: number;
        }[];
      }[]
    | null = null;

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

    hasAccess =
      userRole === "ADMIN" ||
      enrollmentStatus === "APPROVED";

    if (hasAccess) {
      const { data } = await supabase
        .from("chapters")
        .select(`
          id,
          title,
          slug,
          description,
          display_order,
          lessons (
            id,
            title,
            slug,
            summary,
            display_order
          )
        `)
        .eq("subject_id", subject.id)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      chapters = data;
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
            </div>
          )}
      </div>

      {hasAccess && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Conținutul materiei
          </h2>

          {!chapters || chapters.length === 0 ? (
            <div className="mt-6 rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600">
                Nu există încă niciun capitol disponibil.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="rounded-xl border border-gray-200 p-6"
                >
                  <h3 className="text-xl font-semibold text-gray-900">
                    {chapter.title}
                  </h3>

                  {chapter.description && (
                    <p className="mt-2 text-gray-600">
                      {chapter.description}
                    </p>
                  )}

                  {chapter.lessons?.length > 0 ? (
                    <div className="mt-5 space-y-3">
                      {chapter.lessons
                        .sort(
                          (a, b) =>
                            a.display_order - b.display_order
                        )
                        .map((lesson) => (
                          <div
                            key={lesson.id}
                            className="rounded-lg bg-gray-50 px-4 py-3"
                          >
                            <p className="font-medium text-gray-900">
                              {lesson.title}
                            </p>

                            {lesson.summary && (
                              <p className="mt-1 text-sm text-gray-600">
                                {lesson.summary}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-gray-500">
                      Nu există încă lecții disponibile.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}