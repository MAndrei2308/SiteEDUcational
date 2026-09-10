"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { moveItem } from "@/lib/reorder";
import { setItemPosition } from "@/lib/reorder";

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

  const requestedPosition = Number(
    formData.get("displayOrder") ?? 1
  );

  const isActive =
    formData.get("isActive") === "on";

  let content: Record<string, unknown> = {};

  if (type === "HEADING") {
    const text = String(
      formData.get("headingText") ?? ""
    ).trim();

    if (!text) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou?error=${encodeURIComponent(
          "Textul titlului este obligatoriu."
        )}`
      );
    }

    content = {
      text,
      level: String(
        formData.get("headingLevel") ?? "2"
      ),
    };
  }

  if (type === "TEXT") {
    const text = String(
      formData.get("text") ?? ""
    ).trim();

    if (!text) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou?error=${encodeURIComponent(
          "Textul este obligatoriu."
        )}`
      );
    }

    content = { text };
  }

  if (type === "CODE") {
    const code = String(
      formData.get("code") ?? ""
    );

    if (!code.trim()) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou?error=${encodeURIComponent(
          "Codul este obligatoriu."
        )}`
      );
    }

    content = {
      language: String(
        formData.get("language") ?? "text"
      ).trim(),
      code,
    };
  }

  if (!["HEADING", "TEXT", "CODE"].includes(type)) {
    redirect(
      `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou?error=${encodeURIComponent(
        "Tip de bloc invalid."
      )}`
    );
  }

  // Îl introducem temporar la final.
  const { data: lastBlock } = await supabase
    .from("lesson_blocks")
    .select("display_order")
    .eq("lesson_id", lessonId)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const temporaryPosition =
    (lastBlock?.display_order ?? 0) + 1;

  const { data: newBlock, error } = await supabase
    .from("lesson_blocks")
    .insert({
      lesson_id: lessonId,
      type,
      content,
      display_order: temporaryPosition,
      is_active: isActive,
    })
    .select("id")
    .single();

  if (error || !newBlock) {
    redirect(
      `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou?error=${encodeURIComponent(
        error?.message ?? "Blocul nu a putut fi creat."
      )}`
    );
  }

  // Apoi îl mutăm pe poziția aleasă.
  await setItemPosition(
    supabase,
    "lesson_blocks",
    newBlock.id,
    requestedPosition,
    "lesson_id",
    lessonId
  );

  redirect(
    `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/edit`
  );
}

export async function updateLessonBlock(
  subjectId: string,
  chapterId: string,
  lessonId: string,
  blockId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const type = String(formData.get("type") ?? "");

  const displayOrder = Number(
    formData.get("displayOrder") ?? 1
  );

  const isActive =
    formData.get("isActive") === "on";

  let content: Record<string, unknown> = {};

  if (type === "HEADING") {
    const text = String(
      formData.get("headingText") ?? ""
    ).trim();

    if (!text) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${blockId}/edit?error=${encodeURIComponent(
          "Textul titlului este obligatoriu."
        )}`
      );
    }

    content = {
      text,
      level: String(
        formData.get("headingLevel") ?? "2"
      ),
    };
  }

  if (type === "TEXT") {
    const text = String(
      formData.get("text") ?? ""
    ).trim();

    if (!text) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${blockId}/edit?error=${encodeURIComponent(
          "Textul este obligatoriu."
        )}`
      );
    }

    content = { text };
  }

  if (type === "CODE") {
    const code = String(
      formData.get("code") ?? ""
    );

    if (!code.trim()) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${blockId}/edit?error=${encodeURIComponent(
          "Codul este obligatoriu."
        )}`
      );
    }

    content = {
      language: String(
        formData.get("language") ?? "text"
      ),
      code,
    };
  }

  if (!["HEADING", "TEXT", "CODE"].includes(type)) {
    redirect(
      `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${blockId}/edit?error=${encodeURIComponent(
        "Tip de bloc invalid."
      )}`
    );
  }

  const { error } = await supabase
    .from("lesson_blocks")
    .update({
      type,
      content,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", blockId)
    .eq("lesson_id", lessonId);

  if (error) {
    redirect(
      `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${blockId}/edit?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  await setItemPosition(
    supabase,
    "lesson_blocks",
    blockId,
    displayOrder,
    "lesson_id",
    lessonId
  );

  redirect(
    `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/edit`
  );
}

export async function deleteLessonBlock(
  subjectId: string,
  chapterId: string,
  lessonId: string,
  blockId: string
) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("lesson_blocks")
    .delete()
    .eq("id", blockId)
    .eq("lesson_id", lessonId);

  if (error) {
    redirect(
      `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/edit?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  redirect(
    `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/edit`
  );
}

export async function moveLessonBlockUp(
  subjectId: string,
  chapterId: string,
  lessonId: string,
  blockId: string
) {
  const supabase = await createClient();

  await moveItem(
    supabase,
    "lesson_blocks",
    blockId,
    "up",
    "lesson_id",
    lessonId
  );

  redirect(
    `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/edit`
  );
}

export async function moveLessonBlockDown(
  subjectId: string,
  chapterId: string,
  lessonId: string,
  blockId: string
) {
  const supabase = await createClient();

  await moveItem(
    supabase,
    "lesson_blocks",
    blockId,
    "down",
    "lesson_id",
    lessonId
  );

  redirect(
    `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/edit`
  );
}