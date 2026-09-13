import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import ThemeToggle from "@/components/ThemeToggle";

export default async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  let theme: "light" | "dark" = "light";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, theme")
      .eq("id", user.id)
      .single();

    role = profile?.role ?? null;

    if (
      profile?.theme === "light" ||
      profile?.theme === "dark"
    ) {
      theme = profile.theme;
    }
  }

  return (
    <header className="border-b border-gray-200 bg-white transition-colors dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 text-xl font-bold text-gray-900 transition-colors dark:text-white"
        >
          Site EDUcational
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-3 sm:gap-4 lg:gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Acasă
          </Link>

          <Link
            href="/materii"
            className="text-sm font-medium text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Materii
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Dashboard
              </Link>

              <Link
                href="/profil"
                className="text-sm font-medium text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Profil
              </Link>

              {role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Admin
                </Link>
              )}

              <ThemeToggle initialTheme={theme} />

              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
                >
                  Deconectare
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Autentificare
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
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