import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const userId = claimsData.claims.sub;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-4 text-red-600">
          Profilul nu a putut fi încărcat.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900">
        Bun venit, {profile.full_name || "utilizator"}!
      </h1>

      <p className="mt-4 text-gray-600">
        Rol: {profile.role}
      </p>
    </main>
  );
}