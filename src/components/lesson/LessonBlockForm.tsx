"use client";

import { useState } from "react";

type LessonBlockFormProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export default function LessonBlockForm({
  action,
}: LessonBlockFormProps) {
  const [type, setType] = useState("TEXT");

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
              defaultValue="2"
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
              defaultValue="cpp"
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
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono"
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
          min="0"
          defaultValue="0"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <label className="flex items-center gap-3">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked
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
        Salvează blocul
      </button>
    </form>
  );
}