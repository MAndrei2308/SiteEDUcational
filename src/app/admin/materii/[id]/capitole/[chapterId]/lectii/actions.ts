"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { moveItem } from "@/lib/reorder";
import { setItemPosition } from "@/lib/reorder";

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
  
  const { data: lastLesson } = await supabase
    .from("lessons")
    .select("display_order")
    .eq("chapter_id", chapterId)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const displayOrder = (lastLesson?.display_order ?? 0) + 1;

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

  const displayOrder = Number(
    formData.get("displayOrder") ?? 1
  );

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

  await setItemPosition(
    supabase,
    "lessons",
    lessonId,
    displayOrder,
    "chapter_id",
    chapterId
  );

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

export async function moveLessonUp(
  subjectId: string,
  chapterId: string,
  lessonId: string
) {
  const supabase = await createClient();

  await moveItem(
    supabase,
    "lessons",
    lessonId,
    "up",
    "chapter_id",
    chapterId
  );

  redirect(
    `/admin/materii/${subjectId}/capitole/${chapterId}/lectii`
  );
}

export async function moveLessonDown(
  subjectId: string,
  chapterId: string,
  lessonId: string
) {
  const supabase = await createClient();

  await moveItem(
    supabase,
    "lessons",
    lessonId,
    "down",
    "chapter_id",
    chapterId
  );

  redirect(
    `/admin/materii/${subjectId}/capitole/${chapterId}/lectii`
  );
}