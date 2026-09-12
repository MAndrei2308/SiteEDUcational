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

  if (type === "CALLOUT") {
    const text = String(formData.get("calloutText") ?? "").trim();

    if (!text) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou?error=${encodeURIComponent(
          "Textul callout-ului este obligatoriu."
        )}`
      );
    }

    content = {
      variant: String(formData.get("calloutVariant") ?? "info"),
      title: String(formData.get("calloutTitle") ?? "").trim(),
      text,
    };
  }

  if (type === "DIVIDER") {
    content = {};
  }

  if (type === "IMAGE") {
    const imageFile = formData.get("imageFile");
    const alt = String(formData.get("imageAlt") ?? "").trim();
    const caption = String(formData.get("imageCaption") ?? "").trim();

    if (!(imageFile instanceof File) || imageFile.size === 0) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou?error=${encodeURIComponent(
          "Imaginea este obligatorie."
        )}`
      );
    }

    if (!alt) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou?error=${encodeURIComponent(
          "Textul alternativ este obligatoriu."
        )}`
      );
    }

    const extension =
      imageFile.name.split(".").pop()?.toLowerCase() ?? "jpg";

    const fileName = `${crypto.randomUUID()}.${extension}`;

    const filePath =
      `${subjectId}/${chapterId}/${lessonId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("lesson-images")
      .upload(filePath, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou?error=${encodeURIComponent(
          uploadError.message
        )}`
      );
    }

    content = {
      path: filePath,
      alt,
      caption,
    };
  }

  if (type === "DIAGRAM") {
    const code = String(formData.get("diagramCode") ?? "").trim();

    if (!code) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou?error=${encodeURIComponent(
          "Codul diagramei este obligatoriu."
        )}`
      );
    }

    content = { code };
  }

  if (type === "QUIZ") {
    const question = String(
      formData.get("quizQuestion") ?? ""
    ).trim();

    const answers = [0, 1, 2, 3].map((index) =>
      String(
        formData.get(`quizAnswer${index}`) ?? ""
      ).trim()
    );

    const correctAnswer = Number(
      formData.get("quizCorrectAnswer") ?? 0
    );

    const explanation = String(
      formData.get("quizExplanation") ?? ""
    ).trim();

    if (!question || answers.some((answer) => !answer)) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou?error=${encodeURIComponent(
          "Întrebarea și toate variantele de răspuns sunt obligatorii."
        )}`
      );
    }

    content = {
      question,
      answers,
      correctAnswer,
      explanation,
    };
  }

  if (type === "VIDEO") {
    const url = String(formData.get("videoUrl") ?? "").trim();
    const title = String(formData.get("videoTitle") ?? "").trim();

    if (!url) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou?error=${encodeURIComponent(
          "URL-ul video este obligatoriu."
        )}`
      );
    }

    content = {
      url,
      title,
    };
  }

  if (type === "FILE") {
    const lessonFile = formData.get("lessonFile");
    const title = String(formData.get("fileTitle") ?? "").trim();
    const description = String(
      formData.get("fileDescription") ?? ""
    ).trim();

    if (!(lessonFile instanceof File) || lessonFile.size === 0) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou?error=${encodeURIComponent(
          "Fișierul este obligatoriu."
        )}`
      );
    }

    const extension =
      lessonFile.name.split(".").pop()?.toLowerCase() ?? "bin";

    const fileName = `${crypto.randomUUID()}.${extension}`;

    const filePath =
      `${subjectId}/${chapterId}/${lessonId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("lesson-files")
      .upload(filePath, lessonFile, {
        contentType: lessonFile.type || undefined,
        upsert: false,
      });

    if (uploadError) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou?error=${encodeURIComponent(
          uploadError.message
        )}`
      );
    }

    content = {
      path: filePath,
      originalName: lessonFile.name,
      title: title || lessonFile.name,
      description,
    };
  }

  if (type === "LAYOUT") {
    const template = String(
      formData.get("layoutTemplate") ?? "two-columns-50-50"
    );

    if (
      ![
        "two-columns-50-50",
        "two-columns-33-67",
        "two-columns-67-33",
      ].includes(template)
    ) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou?error=${encodeURIComponent(
          "Template de layout invalid."
        )}`
      );
    }

    content = {
      template,
    };
  }

  if (!["HEADING", "TEXT", "CODE", "CALLOUT", "DIVIDER", "IMAGE", "DIAGRAM", "QUIZ", "VIDEO", "FILE", "LAYOUT"].includes(type)) {
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

  if (type === "CALLOUT") {
    const text = String(formData.get("calloutText") ?? "").trim();

    if (!text) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou?error=${encodeURIComponent(
          "Textul callout-ului este obligatoriu."
        )}`
      );
    }

    content = {
      variant: String(formData.get("calloutVariant") ?? "info"),
      title: String(formData.get("calloutTitle") ?? "").trim(),
      text,
    };
  }

  if (type === "DIVIDER") {
    content = {};
  }

  if (type === "IMAGE") {
    const imageFile = formData.get("imageFile");
    const alt = String(formData.get("imageAlt") ?? "").trim();
    const caption = String(formData.get("imageCaption") ?? "").trim();

    if (!alt) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${blockId}/edit?error=${encodeURIComponent(
          "Textul alternativ este obligatoriu."
        )}`
      );
    }

    // Luăm imaginea actuală ca să putem păstra sau înlocui path-ul.
    const { data: existingBlock, error: existingBlockError } =
      await supabase
        .from("lesson_blocks")
        .select("content")
        .eq("id", blockId)
        .eq("lesson_id", lessonId)
        .single();

    if (existingBlockError || !existingBlock) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${blockId}/edit?error=${encodeURIComponent(
          "Blocul nu a putut fi încărcat."
        )}`
      );
    }

    const oldPath = String(existingBlock.content?.path ?? "");

    // Dacă nu alegem o imagine nouă, păstrăm imaginea existentă.
    if (!(imageFile instanceof File) || imageFile.size === 0) {
      if (!oldPath) {
        redirect(
          `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${blockId}/edit?error=${encodeURIComponent(
            "Imaginea este obligatorie."
          )}`
        );
      }

      content = {
        path: oldPath,
        alt,
        caption,
      };
    } else {
      const extension =
        imageFile.name.split(".").pop()?.toLowerCase() ?? "jpg";

      const fileName = `${crypto.randomUUID()}.${extension}`;

      const newPath =
        `${subjectId}/${chapterId}/${lessonId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("lesson-images")
        .upload(newPath, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        redirect(
          `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${blockId}/edit?error=${encodeURIComponent(
            uploadError.message
          )}`
        );
      }

      content = {
        path: newPath,
        alt,
        caption,
      };

      // Upload-ul nou a reușit, deci putem șterge vechea imagine.
      if (oldPath) {
        await supabase.storage
          .from("lesson-images")
          .remove([oldPath]);
      }
    }
  }

  if (type === "DIAGRAM") {
    const code = String(formData.get("diagramCode") ?? "").trim();

    if (!code) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou?error=${encodeURIComponent(
          "Codul diagramei este obligatoriu."
        )}`
      );
    }

    content = { code };
  }

  if (type === "QUIZ") {
    const question = String(
      formData.get("quizQuestion") ?? ""
    ).trim();

    const answers = [0, 1, 2, 3].map((index) =>
      String(
        formData.get(`quizAnswer${index}`) ?? ""
      ).trim()
    );

    const correctAnswer = Number(
      formData.get("quizCorrectAnswer") ?? 0
    );

    const explanation = String(
      formData.get("quizExplanation") ?? ""
    ).trim();

    if (!question || answers.some((answer) => !answer)) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou?error=${encodeURIComponent(
          "Întrebarea și toate variantele de răspuns sunt obligatorii."
        )}`
      );
    }

    content = {
      question,
      answers,
      correctAnswer,
      explanation,
    };
  }

  if (type === "VIDEO") {
    const url = String(formData.get("videoUrl") ?? "").trim();
    const title = String(formData.get("videoTitle") ?? "").trim();

    if (!url) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/nou?error=${encodeURIComponent(
          "URL-ul video este obligatoriu."
        )}`
      );
    }

    content = {
      url,
      title,
    };
  }

  if (type === "FILE") {
    const lessonFile = formData.get("lessonFile");
    const title = String(formData.get("fileTitle") ?? "").trim();
    const description = String(
      formData.get("fileDescription") ?? ""
    ).trim();

    const { data: existingBlock, error: existingBlockError } =
      await supabase
        .from("lesson_blocks")
        .select("content")
        .eq("id", blockId)
        .eq("lesson_id", lessonId)
        .single();

    if (existingBlockError || !existingBlock) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${blockId}/edit?error=${encodeURIComponent(
          "Blocul nu a putut fi încărcat."
        )}`
      );
    }

    const oldPath = String(existingBlock.content?.path ?? "");
    const oldName = String(existingBlock.content?.originalName ?? "");

    if (!(lessonFile instanceof File) || lessonFile.size === 0) {
      if (!oldPath) {
        redirect(
          `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${blockId}/edit?error=${encodeURIComponent(
            "Fișierul este obligatoriu."
          )}`
        );
      }

      content = {
        path: oldPath,
        originalName: oldName,
        title: title || oldName,
        description,
      };
    } else {
      const extension =
        lessonFile.name.split(".").pop()?.toLowerCase() ?? "bin";

      const fileName = `${crypto.randomUUID()}.${extension}`;

      const newPath =
        `${subjectId}/${chapterId}/${lessonId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("lesson-files")
        .upload(newPath, lessonFile, {
          contentType: lessonFile.type || undefined,
          upsert: false,
        });

      if (uploadError) {
        redirect(
          `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${blockId}/edit?error=${encodeURIComponent(
            uploadError.message
          )}`
        );
      }

      content = {
        path: newPath,
        originalName: lessonFile.name,
        title: title || lessonFile.name,
        description,
      };

      if (oldPath) {
        await supabase.storage
          .from("lesson-files")
          .remove([oldPath]);
      }
    }
  }

  if (type === "LAYOUT") {
    const template = String(
      formData.get("layoutTemplate") ?? "two-columns-50-50"
    );

    const supportedTemplates = [
      "two-columns-50-50",
      "two-columns-33-67",
      "two-columns-67-33",
    ];

    if (!supportedTemplates.includes(template)) {
      redirect(
        `/admin/materii/${subjectId}/capitole/${chapterId}/lectii/${lessonId}/blocuri/${blockId}/edit?error=${encodeURIComponent(
          "Template de layout invalid."
        )}`
      );
    }

    content = {
      template,
    };
  }

  if (!["HEADING", "TEXT", "CODE", "CALLOUT", "DIVIDER", "IMAGE", "DIAGRAM", "QUIZ", "VIDEO", "FILE", "LAYOUT"].includes(type)) {
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

  const { data: block } = await supabase
    .from("lesson_blocks")
    .select("type, content")
    .eq("id", blockId)
    .eq("lesson_id", lessonId)
    .single();

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

  if (block?.type === "IMAGE") {
    const imagePath = String(block.content?.path ?? "");

    if (imagePath) {
      await supabase.storage
        .from("lesson-images")
        .remove([imagePath]);
    }
  }

  if (block?.type === "FILE") {
    const filePath = String(block.content?.path ?? "");

    if (filePath) {
      await supabase.storage
        .from("lesson-files")
        .remove([filePath]);
    }
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