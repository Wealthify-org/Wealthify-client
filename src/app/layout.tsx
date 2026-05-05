import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import "@/styles/globals.css";
import ScrollObserver from "@/components/Observers/ScrollObserver";
import { AppProviders } from "./AppProviders";
import AbstractBackgroundShapes from "@/components/UI/AbstractBackgroundShapes/AbstractBackgroundShapes";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wealthify",
  description: "Investment manager with AI analytics",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default async function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  /**
   * Глобальный @modal-slot. Получает контент через intercepting routes
   * вида `app/@modal/(.)auth/sign-in/page.tsx`. Рендерится поверх обычного
   * children и доступен с любой страницы приложения.
   *
   * Раньше слот висел в `(onboarding)/layout.tsx` и работал только из
   * `/`, `/home`, `/favorites` — на остальных страницах модалка не
   * перехватывалась, и клик уходил в полный page-transition.
   */
  modal: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* мэш-градиент рендерится один раз глобально */}
          <AbstractBackgroundShapes />
          <ScrollObserver />
          <AppProviders>
            {children}
            {modal}
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
