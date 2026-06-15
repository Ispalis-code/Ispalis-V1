import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from '@/context/TooltipContext';

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "·ispalis· — Accords mets-vins pour restaurateurs",
  description:
    "Composez votre carte du jour, Ispalis génère les accords mets-boissons en piochant d'abord dans votre cave.",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
