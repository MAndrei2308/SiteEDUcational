import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900">
        Dashboard
      </h1>

      <p className="mt-4 text-gray-600">
        Ești autentificat ca {user.email}.
      </p>
    </main>
  );
}