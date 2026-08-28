import type { Metadata } from "next";
import { Oxygen } from "next/font/google";
import "./globals.css";

const oxygen = Oxygen({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
  variable: "--font-oxygen",
});

export const metadata: Metadata = {
  title: "Infinity Social — Pop Culture Media",
  description: "The premium destination for gaming, anime, and pop culture news, reviews, interviews, and community discussions.",
  keywords: ["gaming", "anime", "pop culture", "reviews", "interviews", "community", "infinity social"],
  authors: [{ name: "Infinity Social" }],
  openGraph: {
    title: "Infinity Social",
    description: "Premium pop culture media — games, anime, and beyond.",
    type: "website",
    siteName: "Infinity Social",
  },
  twitter: {
    card: "summary_large_image",
    title: "Infinity Social",
    description: "Premium pop culture media — games, anime, and beyond.",
  },
};

import { AuthProvider } from "@/components/AuthProvider";
import PageTransitionProvider from "@/components/PageTransitionProvider";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={oxygen.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${oxygen.className} bg-[#050508] text-white min-h-screen antialiased`}>
        <AuthProvider>
          <Suspense fallback={null}>
            <PageTransitionProvider>
              <ScrollRevealProvider>
                {children}
              </ScrollRevealProvider>
            </PageTransitionProvider>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
