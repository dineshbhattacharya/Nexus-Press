import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "NexusPress | Clean, Premium Writing & Publishing",
  description: "A modern platform for newsletter publications, rich-text blogging, and community micro-updates. Build your audience today.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch logged in user on the server to avoid flash of unauthenticated state in the navigation
  const user = await getSessionUser();

  return (
    <html lang="en">
      <body>
        <Navigation initialUser={user} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

