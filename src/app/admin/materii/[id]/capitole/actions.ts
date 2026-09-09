"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createChapter(
  subjectId: string,
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
  const description = String(formData.get("description") ?? "").trim();
  const displayOrder = Number(formData.get("displayOrder") ?? 0);
  const isActive = formData.get("isActive") === "on";

  if (!title || !slug) {
    redirect(
      `/admin/materii/${subjectId}/capitole/nou?error=${encodeURIComponent(
        "Titlul și slug-ul sunt obligatorii."
      )}`
    );
  }

  const { error } = await supabase
    .from("chapters")
    .insert({
      subject_id: subjectId,
      title,
      slug,
      description: description || null,
      display_order: displayOrder,
      is_active: isActive,
    });

  if (error) {
    redirect(
      `/admin/materii/${subjectId}/capitole/nou?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  redirect(`/admin/materii/${subjectId}/capitole`);
}

export async function updateChapter(
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
  const description = String(formData.get("description") ?? "").trim();
  const displayOrder = Number(formData.get("displayOrder") ?? 0);
  const isActive = formData.get("isActive") === "on";

  if (!title || !slug) {
    redirect(
      `/admin/materii/${subjectId}/capitole/${chapterId}/edit?error=${encodeURIComponent(
        "Titlul și slug-ul sunt obligatorii."
      )}`
    );
  }

  const { error } = await supabase
    .from("chapters")
    .update({
      title,
      slug,
      description: description || null,
      display_order: displayOrder,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", chapterId)
    .eq("subject_id", subjectId);

  if (error) {
    redirect(
      `/admin/materii/${subjectId}/capitole/${chapterId}/edit?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  redirect(`/admin/materii/${subjectId}/capitole`);
}

export async function deleteChapter(
  subjectId: string,
  chapterId: string
) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("chapters")
    .delete()
    .eq("id", chapterId)
    .eq("subject_id", subjectId);

  if (error) {
    redirect(
      `/admin/materii/${subjectId}/capitole?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  redirect(`/admin/materii/${subjectId}/capitole`);
}