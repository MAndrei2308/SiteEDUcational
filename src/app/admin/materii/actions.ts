"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { moveItem } from "@/lib/reorder";
import { setItemPosition } from "@/lib/reorder";

export async function createSubject(formData: FormData) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const isActive = formData.get("isActive") === "on";

  if (!name || !slug) {
    redirect(
      `/admin/materii/noua?error=${encodeURIComponent(
        "Numele și slug-ul sunt obligatorii."
      )}`
    );
  }

  const { data: lastSubject } = await supabase
    .from("subjects")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const displayOrder =
    (lastSubject?.display_order ?? 0) + 1;

  const { error } = await supabase
    .from("subjects")
    .insert({
      name,
      slug,
      description: description || null,
      display_order: displayOrder,
      is_active: isActive,
    });

  if (error) {
    redirect(
      `/admin/materii/noua?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  redirect("/admin/materii");
}

export async function updateSubject(
  subjectId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(
    formData.get("description") ?? ""
  ).trim();

  const displayOrder = Number(
    formData.get("displayOrder") ?? 1
  );

  const isActive =
    formData.get("isActive") === "on";

  if (!name || !slug) {
    redirect(
      `/admin/materii/${subjectId}/edit?error=${encodeURIComponent(
        "Numele și slug-ul sunt obligatorii."
      )}`
    );
  }

  const { error } = await supabase
    .from("subjects")
    .update({
      name,
      slug,
      description: description || null,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", subjectId);

  if (error) {
    redirect(
      `/admin/materii/${subjectId}/edit?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  await setItemPosition(
    supabase,
    "subjects",
    subjectId,
    displayOrder
  );

  redirect("/admin/materii");
}

export async function deleteSubject(subjectId: string) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("subjects")
    .delete()
    .eq("id", subjectId);

  if (error) {
    redirect(
      `/admin/materii?error=${encodeURIComponent(error.message)}`
    );
  }

  redirect("/admin/materii");
}

export async function moveSubjectUp(subjectId: string) {
  const supabase = await createClient();

  await moveItem(
    supabase,
    "subjects",
    subjectId,
    "up"
  );

  redirect("/admin/materii");
}

export async function moveSubjectDown(subjectId: string) {
  const supabase = await createClient();

  await moveItem(
    supabase,
    "subjects",
    subjectId,
    "down"
  );

  redirect("/admin/materii");
}