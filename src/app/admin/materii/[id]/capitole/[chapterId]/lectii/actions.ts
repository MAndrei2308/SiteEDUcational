"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createLesson(
  subjectId: string,
  chapterId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const displayOrder = Number(formData.get("displayOrder") ?? 0);
  const isActive = formData.get("isActive") === "on";

  if (!title || !slug) {
    redirect(
      `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/noua?error=${encodeURIComponent(
        "Titlul și slug-ul sunt obligatorii."
      )}`
    );
  }

  const { error } = await supabase
    .from("lessons")
    .insert({
      chapter_id: chapterId,
      title,
      slug,
      summary: summary || null,
      display_order: displayOrder,
      is_active: isActive,
    });

  if (error) {
    redirect(
      `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/noua?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  redirect(
    `/admin/materii/${subjectId}/capitole/${chapterId}/lectii`
  );
}

export async function updateLesson(
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

  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const displayOrder = Number(formData.get("displayOrder") ?? 0);
  const isActive = formData.get("isActive") === "on";

  if (!title || !slug) {
    redirect(
      `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/edit?error=${encodeURIComponent(
        "Titlul și slug-ul sunt obligatorii."
      )}`
    );
  }

  const { error } = await supabase
    .from("lessons")
    .update({
      title,
      slug,
      summary: summary || null,
      display_order: displayOrder,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lessonId)
    .eq("chapter_id", chapterId);

  if (error) {
    redirect(
      `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/edit?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  redirect(
    `/admin/materii/${subjectId}/capitole/${chapterId}/lectii`
  );
}

export async function deleteLesson(
  subjectId: string,
  chapterId: string,
  lessonId: string
) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("lessons")
    .delete()
    .eq("id", lessonId)
    .eq("chapter_id", chapterId);

  if (error) {
    redirect(
      `/admin/materii/${subjectId}/capitole/${chapterId}/lectii?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  redirect(
    `/admin/materii/${subjectId}/capitole/${chapterId}/lectii`
  );
}