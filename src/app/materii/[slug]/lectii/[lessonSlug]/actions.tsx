"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function startLessonProgress(
  lessonId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: existingProgress } = await supabase
    .from("lesson_progress")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (existingProgress) {
    return;
  }

  await supabase
    .from("lesson_progress")
    .insert({
      user_id: user.id,
      lesson_id: lessonId,
      status: "IN_PROGRESS",
      started_at: new Date().toISOString(),
    });
}

export async function completeLesson(
  lessonId: string,
  subjectSlug: string,
  lessonSlug: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const now = new Date().toISOString();

  const { data: existingProgress } = await supabase
    .from("lesson_progress")
    .select("id, started_at")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (existingProgress) {
    await supabase
      .from("lesson_progress")
      .update({
        status: "COMPLETED",
        started_at:
          existingProgress.started_at ?? now,
        completed_at: now,
        updated_at: now,
      })
      .eq("id", existingProgress.id);
  } else {
    await supabase
      .from("lesson_progress")
      .insert({
        user_id: user.id,
        lesson_id: lessonId,
        status: "COMPLETED",
        started_at: now,
        completed_at: now,
      });
  }

  redirect(
    `/materii/${subjectSlug}/lectii/${encodeURIComponent(
      lessonSlug
    )}`
  );
}