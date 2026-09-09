import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const userId = claimsData.claims.sub;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    redirect("/dashboard");
  }

  if (profile.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900">
        Panou administrare
      </h1>

      <p className="mt-4 text-gray-600">
        Ai acces la funcțiile de administrare.
      </p>

      <Link
        href="/admin/materii"
        className="mt-8 inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
      >
        Gestionează materiile
      </Link>

      <Link
        href="/admin/cereri"
        className="ml-4 mt-8 inline-block rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900"
      >
        Gestionează cererile
      </Link>
    </main>
  );
}