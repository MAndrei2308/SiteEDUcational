import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const userId = claimsData.claims.sub;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, role, created_at")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-bold">Profil</h1>
        <p className="mt-4 text-red-600">
          Profilul nu a putut fi încărcat.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Profil</h1>

      <div className="mt-8 space-y-4 rounded-xl border border-gray-200 p-6">
        <div>
          <p className="text-sm text-gray-500">Nume</p>
          <p className="font-medium text-gray-900">
            {profile.full_name || "Nespecificat"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Rol</p>
          <p className="font-medium text-gray-900">{profile.role}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Membru din</p>
          <p className="font-medium text-gray-900">
            {new Date(profile.created_at).toLocaleDateString("ro-RO")}
          </p>
        </div>
      </div>
    </main>
  );
}