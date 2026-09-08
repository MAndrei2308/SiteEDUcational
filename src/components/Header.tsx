import Link from "next/link";

export default function Header() {
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
        </nav>
      </div>
    </header>
  );
}