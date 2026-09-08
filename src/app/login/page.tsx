import { signIn } from "@/app/auth/actions";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900">
        Autentificare
      </h1>

      <form action={signIn} className="mt-8 space-y-4">
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
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-gray-900 px-4 py-2 font-medium text-white"
        >
          Intră în cont
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Nu ai cont?{" "}
        <Link href="/register" className="font-medium text-gray-900 hover:underline">
            Creează un cont
        </Link>
      </p>
    </main>
  );
}