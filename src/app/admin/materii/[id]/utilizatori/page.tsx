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

  // -------------------------------------------------------
  // Materia
  // -------------------------------------------------------

  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("id", id)
    .single();

  if (subjectError || !subject) {
    notFound();
  }

  // -------------------------------------------------------
  // Utilizatorii înscriși
  // -------------------------------------------------------

  const { data: enrollments, error } = await supabase
    .from("enrollments")
    .select(`
      id,
      user_id,
      status,
      created_at,
      profiles (
        full_name
      )
    `)
    .eq("subject_id", id)
    .order("created_at", { ascending: false });

  // -------------------------------------------------------
  // Capitolele active ale materiei
  // -------------------------------------------------------

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id")
    .eq("subject_id", subject.id)
    .eq("is_active", true);

  const chapterIds =
    chapters?.map((chapter) => chapter.id) ?? [];

  // -------------------------------------------------------
  // Lecțiile active ale materiei
  // -------------------------------------------------------

  let lessons:
    | {
        id: string;
      }[]
    | null = [];

  if (chapterIds.length > 0) {
    const { data } = await supabase
      .from("lessons")
      .select("id")
      .in("chapter_id", chapterIds)
      .eq("is_active", true);

    lessons = data;
  }

  const lessonIds =
    lessons?.map((lesson) => lesson.id) ?? [];

  const totalLessons = lessonIds.length;

  // -------------------------------------------------------
  // Progresul elevilor
  // -------------------------------------------------------

  let progressData:
    | {
        user_id: string;
        lesson_id: string;
        status: string;
        updated_at: string;
      }[]
    | null = [];

  if (lessonIds.length > 0) {
    const { data } = await supabase
      .from("lesson_progress")
      .select(`
        user_id,
        lesson_id,
        status,
        updated_at
      `)
      .in("lesson_id", lessonIds);

    progressData = data;
  }

  // -------------------------------------------------------
  // Grupăm progresul după utilizator
  // -------------------------------------------------------

  const progressByUser = new Map<
    string,
    {
      completedLessons: number;
      lastActivity: string | null;
    }
  >();

  for (const progress of progressData ?? []) {
    const current =
      progressByUser.get(progress.user_id) ?? {
        completedLessons: 0,
        lastActivity: null,
      };

    if (progress.status === "COMPLETED") {
      current.completedLessons += 1;
    }

    if (
      !current.lastActivity ||
      new Date(progress.updated_at) >
        new Date(current.lastActivity)
    ) {
      current.lastActivity = progress.updated_at;
    }

    progressByUser.set(progress.user_id, current);
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
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
        Gestionează utilizatorii înscriși și urmărește progresul lor.
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
        <div className="mt-8 overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[1000px] text-left">
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
                  Progres
                </th>

                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                  Ultima activitate
                </th>

                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                  Acțiuni
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {enrollments.map((enrollment) => {
                const enrollmentProfile = Array.isArray(
                  enrollment.profiles
                )
                  ? enrollment.profiles[0]
                  : enrollment.profiles;

                const userProgress =
                  progressByUser.get(enrollment.user_id);

                const completedLessons =
                  userProgress?.completedLessons ?? 0;

                const progressPercent =
                  totalLessons > 0
                    ? Math.round(
                        (completedLessons / totalLessons) *
                          100
                      )
                    : 0;

                return (
                  <tr key={enrollment.id}>
                    <td className="px-4 py-4 text-gray-900">
                      {enrollmentProfile?.full_name || "Utilizator"}
                    </td>

                    <td className="px-4 py-4">
                      {enrollment.status === "APPROVED" && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Aprobat
                        </span>
                      )}

                      {enrollment.status === "PENDING" && (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                          În așteptare
                        </span>
                      )}

                      {enrollment.status === "REJECTED" && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                          Respins
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(
                        enrollment.created_at
                      ).toLocaleDateString("ro-RO")}
                    </td>

                    <td className="px-4 py-4">
                      {enrollment.status === "APPROVED" ? (
                        <div className="min-w-44">
                          <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-gray-600">
                              {completedLessons}/{totalLessons}
                            </span>

                            <span className="font-medium text-gray-900">
                              {progressPercent}%
                            </span>
                          </div>

                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-gray-900"
                              style={{
                                width: `${progressPercent}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600">
                      {userProgress?.lastActivity
                        ? new Date(
                            userProgress.lastActivity
                          ).toLocaleString("ro-RO", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Fără activitate"}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-3">
                        {enrollment.status !==
                          "APPROVED" && (
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

                        {enrollment.status ===
                          "PENDING" && (
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
                          <Link
                            href={`/admin/materii/${subject.id}/utilizatori/${enrollment.user_id}`}
                            className="text-sm font-medium text-blue-700 hover:text-blue-800"
                          >
                            Vezi progresul
                          </Link>
                        )}

                        {enrollment.status ===
                          "APPROVED" && (
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}