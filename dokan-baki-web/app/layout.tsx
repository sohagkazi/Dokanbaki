import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/bottom-nav";
import { getCurrentShopId, getCurrentUserId } from "@/lib/auth";
import { AiChatWidget } from "@/components/ai-chat-widget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dokan Baki",
  description: "Your digital ledger",
  icons: {
    icon: '/logo.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zooming for native app feel
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shopId = await getCurrentShopId();
  const userId = await getCurrentUserId();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        {shopId && <BottomNav />}
        {userId && <AiChatWidget />}
      </body>
    </html>
  );
}
