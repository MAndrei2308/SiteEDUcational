import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role === "ADMIN") {
    redirect("/admin");
  }

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      subject_id,
      subjects (
        id,
        name,
        slug,
        description,
        is_active
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "APPROVED");

  const approvedSubjects =
    enrollments
      ?.map((enrollment) =>
        Array.isArray(enrollment.subjects)
          ? enrollment.subjects[0]
          : enrollment.subjects
      )
      .filter(
        (
          subject
        ): subject is {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          is_active: boolean;
        } => Boolean(subject?.is_active)
      ) ?? [];

  const subjectIds = approvedSubjects.map(
    (subject) => subject.id
  );

  let chapters:
    | {
        id: string;
        subject_id: string;
        lessons: {
          id: string;
        }[];
      }[]
    | null = [];

  if (subjectIds.length > 0) {
    const { data } = await supabase
      .from("chapters")
      .select(`
        id,
        subject_id,
        lessons (
          id
        )
      `)
      .in("subject_id", subjectIds)
      .eq("is_active", true);

    chapters = data;
  }

  const { data: progressData } = await supabase
    .from("lesson_progress")
    .select("lesson_id, status")
    .eq("user_id", user.id);

  const progressMap = new Map(
    (progressData ?? []).map((item) => [
      item.lesson_id,
      item.status,
    ])
  );

  const subjectsWithProgress = approvedSubjects.map(
    (subject) => {
      const subjectChapters =
        chapters?.filter(
          (chapter) =>
            chapter.subject_id === subject.id
        ) ?? [];

      const lessons = subjectChapters.flatMap(
        (chapter) => chapter.lessons ?? []
      );

      const totalLessons = lessons.length;

      const completedLessons = lessons.filter(
        (lesson) =>
          progressMap.get(lesson.id) === "COMPLETED"
      ).length;

      const progress =
        totalLessons > 0
          ? Math.round(
              (completedLessons / totalLessons) * 100
            )
          : 0;

      return {
        ...subject,
        totalLessons,
        completedLessons,
        progress,
      };
    }
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div>
        <p className="text-sm font-medium text-gray-500">
          Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Bun venit
          {profile?.full_name
            ? `, ${profile.full_name}`
            : ""}
        </h1>

        <p className="mt-3 text-gray-600">
          Aici poți urmări materiile la care ai acces și
          progresul tău.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-gray-900">
          Materiile mele
        </h2>

        {subjectsWithProgress.length === 0 ? (
          <div className="mt-6 rounded-xl border border-gray-200 p-6">
            <p className="text-gray-600">
              Nu ai încă acces aprobat la nicio materie.
            </p>

            <Link
              href="/materii"
              className="mt-4 inline-block text-sm font-medium text-gray-900 underline"
            >
              Vezi materiile disponibile
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {subjectsWithProgress.map((subject) => (
              <div
                key={subject.id}
                className="rounded-xl border border-gray-200 p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  {subject.name}
                </h3>

                {subject.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {subject.description}
                  </p>
                )}

                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Progres
                    </span>

                    <span className="font-medium text-gray-900">
                      {subject.completedLessons}/
                      {subject.totalLessons} lecții
                      {" · "}
                      {subject.progress}%
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gray-900"
                      style={{
                        width: `${subject.progress}%`,
                      }}
                    />
                  </div>
                </div>

                <Link
                  href={`/materii/${subject.slug}`}
                  className="mt-6 inline-flex rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                >
                  Deschide materia
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}