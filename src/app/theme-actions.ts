"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateTheme(
  theme: "light" | "dark"
) {
  if (theme !== "light" && theme !== "dark") {
    return;
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      theme,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

    if (error) {
        console.error("THEME UPDATE ERROR:", error);

        throw new Error(
            `Tema nu a putut fi salvată: ${error.message}`
        );
    }
}