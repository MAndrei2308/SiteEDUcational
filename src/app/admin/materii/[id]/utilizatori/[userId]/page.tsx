import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type StudentProgressPageProps = {
  params: Promise<{
    id: string;
    userId: string;
  }>;
};

export default async function StudentProgressPage({
  params,
}: StudentProgressPageProps) {
  const { id, userId } = await params;

  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const adminId = claimsData.claims.sub;

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", adminId)
    .single();

  if (adminProfile?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { data: subject, error: subjectError } =
    await supabase
      .from("subjects")
      .select("id, name")
      .eq("id", id)
      .single();

  if (subjectError || !subject) {
    notFound();
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select(`
      id,
      status,
      profiles (
        full_name
      )
    `)
    .eq("subject_id", subject.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (!enrollment) {
    notFound();
  }

  const { data: chapters } = await supabase
    .from("chapters")
    .select(`
      id,
      title,
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
    .order("display_order", {
      ascending: true,
    });

  const lessonIds =
    chapters?.flatMap((chapter) =>
      (chapter.lessons ?? []).map(
        (lesson) => lesson.id
      )
    ) ?? [];

  let progressData:
    | {
        lesson_id: string;
        status: string;
        started_at: string | null;
        completed_at: string | null;
        updated_at: string;
      }[]
    | null = [];

  if (lessonIds.length > 0) {
    const { data } = await supabase
      .from("lesson_progress")
      .select(`
        lesson_id,
        status,
        started_at,
        completed_at,
        updated_at
      `)
      .eq("user_id", userId)
      .in("lesson_id", lessonIds);

    progressData = data;
  }

  const progressMap = new Map(
    (progressData ?? []).map((progress) => [
      progress.lesson_id,
      progress,
    ])
  );

  const totalLessons = lessonIds.length;

  const completedLessons =
    progressData?.filter(
      (progress) =>
        progress.status === "COMPLETED"
    ).length ?? 0;

  const totalProgress =
    totalLessons > 0
      ? Math.round(
          (completedLessons / totalLessons) * 100
        )
      : 0;

  const lastActivity =
    progressData && progressData.length > 0
      ? progressData.reduce(
          (latest, current) =>
            new Date(current.updated_at) >
            new Date(latest.updated_at)
              ? current
              : latest
        ).updated_at
      : null;

  const studentName =
    enrollment.profiles?.full_name ??
    "Utilizator";

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <Link
        href={`/admin/materii/${subject.id}/utilizatori`}
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        ← Înapoi la utilizatori
      </Link>

      <div className="mt-6">
        <p className="text-sm font-medium text-gray-500">
          Progres elev
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          {studentName}
        </h1>

        <p className="mt-2 text-gray-600">
          Materie: {subject.name}
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Progres total
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              {completedLessons}/{totalLessons} lecții finalizate
            </p>
          </div>

          <span className="text-2xl font-bold text-gray-900">
            {totalProgress}%
          </span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gray-900"
            style={{
              width: `${totalProgress}%`,
            }}
          />
        </div>

        <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <span className="text-gray-500">
              Status acces
            </span>

            <p className="mt-1 font-medium text-gray-900">
              {enrollment.status}
            </p>
          </div>

          <div>
            <span className="text-gray-500">
              Ultima activitate
            </span>

            <p className="mt-1 font-medium text-gray-900">
              {lastActivity
                ? new Date(
                    lastActivity
                  ).toLocaleString("ro-RO")
                : "Fără activitate"}
            </p>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-gray-900">
          Progres pe capitole
        </h2>

        {!chapters || chapters.length === 0 ? (
          <div className="mt-6 rounded-xl border border-gray-200 p-6">
            <p className="text-gray-600">
              Nu există capitole active.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {chapters.map((chapter) => {
              const orderedLessons = [
                ...(chapter.lessons ?? []),
              ].sort(
                (a, b) =>
                  a.display_order -
                  b.display_order
              );

              const chapterCompleted =
                orderedLessons.filter(
                  (lesson) =>
                    progressMap.get(lesson.id)
                      ?.status === "COMPLETED"
                ).length;

              const chapterProgress =
                orderedLessons.length > 0
                  ? Math.round(
                      (chapterCompleted /
                        orderedLessons.length) *
                        100
                    )
                  : 0;

              return (
                <div
                  key={chapter.id}
                  className="rounded-xl border border-gray-200 p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {chapter.title}
                      </h3>

                      {chapter.description && (
                        <p className="mt-1 text-sm text-gray-600">
                          {chapter.description}
                        </p>
                      )}
                    </div>

                    <span className="text-sm font-medium text-gray-900">
                      {chapterCompleted}/
                      {orderedLessons.length}
                      {" · "}
                      {chapterProgress}%
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gray-900"
                      style={{
                        width: `${chapterProgress}%`,
                      }}
                    />
                  </div>

                  {orderedLessons.length > 0 ? (
                    <div className="mt-5 space-y-3">
                      {orderedLessons.map(
                        (lesson) => {
                          const progress =
                            progressMap.get(
                              lesson.id
                            );

                          const status =
                            progress?.status ??
                            "NOT_STARTED";

                          return (
                            <div
                              key={lesson.id}
                              className="rounded-lg bg-gray-50 px-4 py-3"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {lesson.title}
                                  </p>

                                  {lesson.summary && (
                                    <p className="mt-1 text-sm text-gray-600">
                                      {lesson.summary}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  {status ===
                                    "COMPLETED" && (
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                      Finalizată
                                    </span>
                                  )}

                                  {status ===
                                    "IN_PROGRESS" && (
                                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                                      În progres
                                    </span>
                                  )}

                                  {status ===
                                    "NOT_STARTED" && (
                                    <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                                      Neîncepută
                                    </span>
                                  )}
                                </div>
                              </div>

                              {progress && (
                                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
                                  {progress.started_at && (
                                    <span>
                                      Începută:{" "}
                                      {new Date(
                                        progress.started_at
                                      ).toLocaleString(
                                        "ro-RO"
                                      )}
                                    </span>
                                  )}

                                  {progress.completed_at && (
                                    <span>
                                      Finalizată:{" "}
                                      {new Date(
                                        progress.completed_at
                                      ).toLocaleString(
                                        "ro-RO"
                                      )}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-gray-500">
                      Nu există lecții active în acest capitol.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}