"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requestEnrollment(
  subjectId: string,
  slug: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("enrollments")
    .insert({
      user_id: user.id,
      subject_id: subjectId,
      status: "PENDING",
    });

  if (error) {
    redirect(
      `/materii/${slug}?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(`/materii/${slug}`);
  redirect(`/materii/${slug}`);
}