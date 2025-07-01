// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nova Escola",
  description: "Seu aplicativo Nova Escola para acesso rápido.",
  manifest: "/manifest.json",
  themeColor: "#007bff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nova Escola",
  },
  icons: {
    apple: "/icons/icon-192x192.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
