import Link from "next/link";
import { createSubject } from "@/app/admin/materii/actions";

type NewSubjectPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewSubjectPage({
  searchParams,
}: NewSubjectPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/admin/materii"
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        ← Înapoi la materii
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-gray-900">
        Adaugă materie
      </h1>

      <p className="mt-2 text-gray-600">
        Creează o materie nouă în platformă.
      </p>

      {params.error && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {params.error}
        </div>
      )}

      <form action={createSubject} className="mt-8 space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nume
          </label>

          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-gray-700"
          >
            Slug
          </label>

          <input
            id="slug"
            name="slug"
            type="text"
            required
            placeholder="informatica"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />

          <p className="mt-1 text-sm text-gray-500">
            Va fi folosit ulterior în URL, de exemplu /materii/informatica.
          </p>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Descriere
          </label>

          <textarea
            id="description"
            name="description"
            rows={4}
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
            Materie activă
          </span>
        </label>

        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white"
        >
          Salvează materia
        </button>
      </form>
    </main>
  );
}