type ReorderItem = {
  id: string;
  display_order: number;
};

export async function moveItem(
  supabase: any,
  table: string,
  itemId: string,
  direction: "up" | "down",
  parentColumn?: string,
  parentId?: string
) {
  let query = supabase
    .from(table)
    .select("id, display_order")
    .order("display_order", { ascending: true });

  if (parentColumn && parentId) {
    query = query.eq(parentColumn, parentId);
  }

  const { data, error } = await query;

  if (error || !data) {
    return;
  }

  const items = data as ReorderItem[];

  const index = items.findIndex((item) => item.id === itemId);

  if (index === -1) {
    return;
  }

  const targetIndex =
    direction === "up"
      ? index - 1
      : index + 1;

  if (targetIndex < 0 || targetIndex >= items.length) {
    return;
  }

  const current = items[index];
  const target = items[targetIndex];

  await supabase
    .from(table)
    .update({
      display_order: target.display_order,
    })
    .eq("id", current.id);

  await supabase
    .from(table)
    .update({
      display_order: current.display_order,
    })
    .eq("id", target.id);
}

export async function setItemPosition(
  supabase: any,
  table: string,
  itemId: string,
  newPosition: number,
  parentColumn?: string,
  parentId?: string
) {
  let query = supabase
    .from(table)
    .select("id, display_order")
    .order("display_order", { ascending: true });

  if (parentColumn && parentId) {
    query = query.eq(parentColumn, parentId);
  }

  const { data: items, error } = await query;

  if (error || !items) {
    return;
  }

  const currentItem = items.find(
    (item: { id: string }) => item.id === itemId
  );

  if (!currentItem) {
    return;
  }

  // Scoatem elementul pe care îl mutăm
  const remainingItems = items.filter(
    (item: { id: string }) => item.id !== itemId
  );

  // Nu permitem poziții < 1 sau > numărul total de elemente
  const safePosition = Math.max(
    1,
    Math.min(newPosition, items.length)
  );

  // Îl introducem pe poziția dorită
  remainingItems.splice(
    safePosition - 1,
    0,
    currentItem
  );

  // Renumerotăm toate elementele: 1, 2, 3, 4...
  for (let index = 0; index < remainingItems.length; index++) {
    const item = remainingItems[index];

    const { error: updateError } = await supabase
      .from(table)
      .update({
        display_order: index + 1,
      })
      .eq("id", item.id);

    if (updateError) {
      throw updateError;
    }
  }
}