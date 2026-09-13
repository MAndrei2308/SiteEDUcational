import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import "./globals.css";

import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Site EDUcational",
  description:
    "Platformă educațională pentru elevi și profesori.",
};

export default async function RootLayout({
  children,
}: LayoutProps<"/">) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let theme: "light" | "dark" = "light";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("theme")
      .eq("id", user.id)
      .single();

    if (
      profile?.theme === "light" ||
      profile?.theme === "dark"
    ) {
      theme = profile.theme;
    }
  }

  return (
    <html
      lang="ro"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${
        theme === "dark" ? "dark" : ""
      } h-full antialiased`}
    >
      <body className="min-h-full text-gray-900 transition-colors dark:text-gray-100">
        <Header />

        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}