import Link from "next/link";

export default function Header() {
  return (
    <header>
      <nav>
        <Link href="/">Site EDUcational</Link>

        <div>
          <Link href="/">Acasă</Link>
          <Link href="/materii">Materii</Link>
        </div>
      </nav>
    </header>
  );
}