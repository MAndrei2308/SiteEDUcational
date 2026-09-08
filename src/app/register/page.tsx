import Link from "next/link";
import { signUp } from "@/app/auth/actions";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900">
        Creează cont
      </h1>

      {params.error && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {params.error}
        </div>
      )}

      {params.message && (
        <div className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {params.message}
        </div>
      )}

      <form action={signUp} className="mt-8 space-y-4">
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700"
          >
            Nume complet
          </label>

          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Parolă
          </label>

          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-gray-900 px-4 py-2 font-medium text-white"
        >
          Înregistrare
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Ai deja cont?{" "}
        <Link
          href="/login"
          className="font-medium text-gray-900 hover:underline"
        >
          Autentifică-te
        </Link>
      </p>
    </main>
  );
}