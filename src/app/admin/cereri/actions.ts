"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function approveEnrollment(enrollmentId: string) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("enrollments")
    .update({ status: "APPROVED" })
    .eq("id", enrollmentId);

  if (error) {
    redirect(
      `/admin/cereri?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/admin/cereri");
  redirect("/admin/cereri");
}

export async function rejectEnrollment(enrollmentId: string) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("enrollments")
    .update({ status: "REJECTED" })
    .eq("id", enrollmentId);

  if (error) {
    redirect(
      `/admin/cereri?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/admin/cereri");
  redirect("/admin/cereri");
}