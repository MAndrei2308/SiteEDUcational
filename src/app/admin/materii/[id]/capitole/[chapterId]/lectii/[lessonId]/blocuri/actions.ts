"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createLessonBlock(
  subjectId: string,
  chapterId: string,
  lessonId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const type = String(formData.get("type") ?? "");
  const displayOrder = Number(formData.get("displayOrder") ?? 0);
  const isActive = formData.get("isActive") === "on";

  let content: Record<string, unknown> = {};

  if (type === "HEADING") {
    content = {
      text: String(formData.get("headingText") ?? "").trim(),
      level: String(formData.get("headingLevel") ?? "2"),
    };
  }

  if (type === "TEXT") {
    content = {
      text: String(formData.get("text") ?? "").trim(),
    };
  }

  if (type === "CODE") {
    content = {
      language: String(formData.get("language") ?? "text").trim(),
      code: String(formData.get("code") ?? ""),
    };
  }

  if (!["HEADING", "TEXT", "CODE"].includes(type)) {
    redirect(
      `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou?error=${encodeURIComponent(
        "Tip de bloc invalid."
      )}`
    );
  }

  const { error } = await supabase.from("lesson_blocks").insert({
    lesson_id: lessonId,
    type,
    content,
    display_order: displayOrder,
    is_active: isActive,
  });

  if (error) {
    redirect(
      `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  redirect(
    `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/edit`
  );
}