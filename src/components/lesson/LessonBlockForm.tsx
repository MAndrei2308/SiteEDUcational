"use client";

import { useState } from "react";

type LessonBlockFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  initialType?: string;
  initialContent?: Record<string, unknown>;
  initialDisplayOrder?: number;
  initialIsActive?: boolean;
  submitLabel?: string;
};

export default function LessonBlockForm({
  action,
  initialType = "TEXT",
  initialContent = {},
  initialDisplayOrder = 1,
  initialIsActive = true,
  submitLabel = "Salvează blocul",
}: LessonBlockFormProps) {
  const [type, setType] = useState(initialType);
  const hasExistingImage = Boolean(initialContent.path);

  return (
    <form action={action} className="mt-8 space-y-6">
      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700"
        >
          Tip bloc
        </label>

        <select
          id="type"
          name="type"
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="HEADING">Titlu</option>
          <option value="TEXT">Text</option>
          <option value="CODE">Cod</option>
          <option value="CALLOUT">Callout</option>
          <option value="DIVIDER">Separator</option>
          <option value="IMAGE">Imagine</option>
        </select>
      </div>

      {type === "HEADING" && (
        <>
          <div>
            <label
              htmlFor="headingText"
              className="block text-sm font-medium text-gray-700"
            >
              Text titlu
            </label>

            <input
              id="headingText"
              name="headingText"
              type="text"
              required
              defaultValue={String(initialContent.text ?? "")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="headingLevel"
              className="block text-sm font-medium text-gray-700"
            >
              Nivel titlu
            </label>

            <select
              id="headingLevel"
              name="headingLevel"
              defaultValue={String(initialContent.level ?? "2")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="2">H2</option>
              <option value="3">H3</option>
              <option value="4">H4</option>
            </select>
          </div>
        </>
      )}

      {type === "TEXT" && (
        <div>
          <label
            htmlFor="text"
            className="block text-sm font-medium text-gray-700"
          >
            Text
          </label>

          <textarea
            id="text"
            name="text"
            rows={8}
            required
            defaultValue={String(initialContent.text ?? "")}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
      )}

      {type === "CODE" && (
        <>
          <div>
            <label
              htmlFor="language"
              className="block text-sm font-medium text-gray-700"
            >
              Limbaj
            </label>

            <select
              id="language"
              name="language"
              defaultValue={String(initialContent.language ?? "cpp")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="sql">SQL</option>
              <option value="text">Text</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700"
            >
              Cod
            </label>

            <textarea
              id="code"
              name="code"
              rows={10}
              required
              spellCheck={false}
              defaultValue={String(initialContent.code ?? "")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono"
            />
          </div>
        </>
      )}

      {type === "CALLOUT" && (
        <>
          <div>
            <label
              htmlFor="calloutVariant"
              className="block text-sm font-medium text-gray-700"
            >
              Tip callout
            </label>

            <select
              id="calloutVariant"
              name="calloutVariant"
              defaultValue={String(initialContent.variant ?? "info")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="info">Info</option>
              <option value="tip">Sfat</option>
              <option value="warning">Atenție</option>
              <option value="success">Important / Reținut</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="calloutTitle"
              className="block text-sm font-medium text-gray-700"
            >
              Titlu opțional
            </label>

            <input
              id="calloutTitle"
              name="calloutTitle"
              type="text"
              defaultValue={String(initialContent.title ?? "")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="calloutText"
              className="block text-sm font-medium text-gray-700"
            >
              Text
            </label>

            <textarea
              id="calloutText"
              name="calloutText"
              rows={5}
              required
              defaultValue={String(initialContent.text ?? "")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </>
      )}

      {type === "IMAGE" && (
        <>
          <div>
            <label
              htmlFor="imageFile"
              className="block text-sm font-medium text-gray-700"
            >
              Imagine
            </label>

            <input
              id="imageFile"
              name="imageFile"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              required={!hasExistingImage}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />

            {hasExistingImage && (
              <p className="mt-1 text-xs text-gray-500">
                Dacă nu alegi o imagine nouă, imaginea actuală va fi păstrată.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="imageAlt"
              className="block text-sm font-medium text-gray-700"
            >
              Text alternativ
            </label>

            <input
              id="imageAlt"
              name="imageAlt"
              type="text"
              required
              defaultValue={String(initialContent.alt ?? "")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="imageCaption"
              className="block text-sm font-medium text-gray-700"
            >
              Legendă
            </label>

            <input
              id="imageCaption"
              name="imageCaption"
              type="text"
              defaultValue={String(initialContent.caption ?? "")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </>
      )}

      <div>
        <label
          htmlFor="displayOrder"
          className="block text-sm font-medium text-gray-700"
        >
          Ordine afișare
        </label>

        <input
          id="displayOrder"
          name="displayOrder"
          type="number"
          min="1"
          defaultValue={initialDisplayOrder}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <label className="flex items-center gap-3">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={initialIsActive}
          className="h-4 w-4"
        />

        <span className="text-sm font-medium text-gray-700">
          Bloc activ
        </span>
      </label>

      <button
        type="submit"
        className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}