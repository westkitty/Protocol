import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { SafetyBanner } from "@/components/SafetyBanner";
import { getAllScenes } from "@/lib/scenes";
import "./globals.css";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-barlow",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Protocol — Scene Library & Negotiation Templates",
  description:
    "Privacy-first structured scene library, negotiation checklists, partner comparison, and offline Markdown exports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sceneIndex = getAllScenes().map((s) => ({
    id: s.id,
    title: s.title,
    discreet_title: s.discreet_title,
    category: s.category,
    category_slug: s.category_slug,
    intensity: s.intensity,
  }));

  return (
    <html lang="en" className={`${barlow.variable} ${inter.variable}`}>
      <body className="antialiased bg-[#070709] text-[#F5F5F7] flex flex-col min-h-screen">
        <AppProvider>
          <Header scenes={sceneIndex} />
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {children}
          </main>
          <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 pb-24 md:pb-8">
            <SafetyBanner compact />
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
