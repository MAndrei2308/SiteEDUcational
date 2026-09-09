"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function updateEnrollmentStatus(
  enrollmentId: string,
  subjectId: string,
  status: "APPROVED" | "REJECTED"
) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("enrollments")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", enrollmentId);

  if (error) {
    redirect(
      `/admin/materii/${subjectId}/utilizatori?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath(`/admin/materii/${subjectId}/utilizatori`);
  redirect(`/admin/materii/${subjectId}/utilizatori`);
}

export async function approveEnrollment(
  enrollmentId: string,
  subjectId: string
) {
  return updateEnrollmentStatus(
    enrollmentId,
    subjectId,
    "APPROVED"
  );
}

export async function rejectEnrollment(
  enrollmentId: string,
  subjectId: string
) {
  return updateEnrollmentStatus(
    enrollmentId,
    subjectId,
    "REJECTED"
  );
}

export async function revokeEnrollment(
  enrollmentId: string,
  subjectId: string
) {
  return updateEnrollmentStatus(
    enrollmentId,
    subjectId,
    "REJECTED"
  );
}

export async function deleteEnrollment(
  enrollmentId: string,
  subjectId: string
) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("enrollments")
    .delete()
    .eq("id", enrollmentId);

  if (error) {
    redirect(
      `/admin/materii/${subjectId}/utilizatori?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath(`/admin/materii/${subjectId}/utilizatori`);
  redirect(`/admin/materii/${subjectId}/utilizatori`);
}