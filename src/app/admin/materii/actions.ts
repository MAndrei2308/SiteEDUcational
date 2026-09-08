"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
  const displayOrder = Number(formData.get("displayOrder") ?? 0);
  const isActive = formData.get("isActive") === "on";

  if (!name || !slug) {
    redirect(
      "/admin/materii/noua?error=Numele și slug-ul sunt obligatorii."
    );
  }

  const { error } = await supabase.from("subjects").insert({
    name,
    slug,
    description: description || null,
    display_order: displayOrder,
    is_active: isActive,
  });

  if (error) {
    redirect(
      `/admin/materii/noua?error=${encodeURIComponent(error.message)}`
    );
  }

  redirect("/admin/materii");
}