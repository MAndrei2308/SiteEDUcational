import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Site EDUcational
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 transition hover:text-gray-900"
          >
            Acasă
          </Link>

          <Link
            href="/materii"
            className="text-sm font-medium text-gray-700 transition hover:text-gray-900"
          >
            Materii
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 transition hover:text-gray-900"
              >
                Dashboard
              </Link>

              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                >
                  Deconectare
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 transition hover:text-gray-900"
              >
                Autentificare
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
              >
                Creează cont
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}