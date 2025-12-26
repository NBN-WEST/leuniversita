import type { Metadata } from "next";
import "./globals.css";
import CookieConsentParams from "@/components/privacy/CookieConsentParams";

export const metadata: Metadata = {
  title: "Le Università - Pilot",
  description: "AI Tutor Istituzionale",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="bg-slate-50 text-slate-900 antialiased font-sans" suppressHydrationWarning>
        {children}
        <CookieConsentParams />
      </body>
    </html>
  );
}
