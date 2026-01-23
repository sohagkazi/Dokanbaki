import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/bottom-nav";
import { getCurrentShopId, getCurrentUserId } from "@/lib/auth";
import { AiChatWidget } from "@/components/ai-chat-widget";

const inter = Inter({ subsets: ["latin"] });

export const runtime = 'nodejs';

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

import { ThemeProvider } from "@/components/theme-provider";
import { getUserById } from "@/lib/db";

// ... existing imports

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shopId = await getCurrentShopId();
  const userId = await getCurrentUserId();
  const user = userId ? await getUserById(userId) : null;

  // Fetch Shop Theme if shop selected
  let activeTheme = user?.theme;
  if (shopId) {
    const { getShopById } = await import('@/lib/db');
    const shop = await getShopById(shopId);
    if (shop?.theme) {
      activeTheme = shop.theme;
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased bg-gray-50`}
        suppressHydrationWarning
      >
        <ThemeProvider theme={activeTheme}>
          {children}
          {shopId && <BottomNav />}
          {userId && <AiChatWidget />}
        </ThemeProvider>
      </body>
    </html>
  );
}
