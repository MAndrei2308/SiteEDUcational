"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addBlockToLayout(
  subjectId: string,
  chapterId: string,
  lessonId: string,
  layoutBlockId: string,
  childBlockId: string,
  slot: "left" | "right"
) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const { data: lastItem } = await supabase
    .from("lesson_layout_items")
    .select("display_order")
    .eq("layout_block_id", layoutBlockId)
    .eq("slot", slot)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const displayOrder =
    (lastItem?.display_order ?? 0) + 1;

  const { error } = await supabase
    .from("lesson_layout_items")
    .insert({
      layout_block_id: layoutBlockId,
      child_block_id: childBlockId,
      slot,
      display_order: displayOrder,
    });

  if (error) {
    redirect(
      `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${layoutBlockId}/layout?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  redirect(
    `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${layoutBlockId}/layout`
  );
}

export async function removeBlockFromLayout(
  subjectId: string,
  chapterId: string,
  lessonId: string,
  layoutBlockId: string,
  childBlockId: string
) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("lesson_layout_items")
    .delete()
    .eq("layout_block_id", layoutBlockId)
    .eq("child_block_id", childBlockId);

  if (error) {
    redirect(
      `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${layoutBlockId}/layout?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  redirect(
    `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${layoutBlockId}/layout`
  );
}

export async function moveLayoutItemUp(
  subjectId: string,
  chapterId: string,
  lessonId: string,
  layoutBlockId: string,
  childBlockId: string,
  slot: "left" | "right"
) {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("lesson_layout_items")
    .select("id, child_block_id, display_order")
    .eq("layout_block_id", layoutBlockId)
    .eq("slot", slot)
    .order("display_order", { ascending: true });

  if (!items) return;

  const index = items.findIndex(
    (item) => item.child_block_id === childBlockId
  );

  if (index <= 0) {
    redirect(
      `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${layoutBlockId}/layout`
    );
  }

  const current = items[index];
  const previous = items[index - 1];

  await supabase
    .from("lesson_layout_items")
    .update({ display_order: previous.display_order })
    .eq("id", current.id);

  await supabase
    .from("lesson_layout_items")
    .update({ display_order: current.display_order })
    .eq("id", previous.id);

  redirect(
    `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${layoutBlockId}/layout`
  );
}

export async function moveLayoutItemDown(
  subjectId: string,
  chapterId: string,
  lessonId: string,
  layoutBlockId: string,
  childBlockId: string,
  slot: "left" | "right"
) {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("lesson_layout_items")
    .select("id, child_block_id, display_order")
    .eq("layout_block_id", layoutBlockId)
    .eq("slot", slot)
    .order("display_order", { ascending: true });

  if (!items) return;

  const index = items.findIndex(
    (item) => item.child_block_id === childBlockId
  );

  if (index === -1 || index >= items.length - 1) {
    redirect(
      `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${layoutBlockId}/layout`
    );
  }

  const current = items[index];
  const next = items[index + 1];

  await supabase
    .from("lesson_layout_items")
    .update({ display_order: next.display_order })
    .eq("id", current.id);

  await supabase
    .from("lesson_layout_items")
    .update({ display_order: current.display_order })
    .eq("id", next.id);

  redirect(
    `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${layoutBlockId}/layout`
  );
}

export async function moveLayoutItemToSlot(
  subjectId: string,
  chapterId: string,
  lessonId: string,
  layoutBlockId: string,
  childBlockId: string,
  targetSlot: "left" | "right"
) {
  const supabase = await createClient();

  const { data: lastItem } = await supabase
    .from("lesson_layout_items")
    .select("display_order")
    .eq("layout_block_id", layoutBlockId)
    .eq("slot", targetSlot)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const newOrder =
    (lastItem?.display_order ?? 0) + 1;

  await supabase
    .from("lesson_layout_items")
    .update({
      slot: targetSlot,
      display_order: newOrder,
    })
    .eq("layout_block_id", layoutBlockId)
    .eq("child_block_id", childBlockId);

  redirect(
    `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${layoutBlockId}/layout`
  );
}