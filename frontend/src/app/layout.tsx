import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner"; // 1. Import du composant Toaster de sonner
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const serifFont = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KUSI | Système de Gestion de Livraison",
  description: "Plateforme de gestion logistique et de livraison à Lomé",
  icons: {
    icon: "/KusiLogo.png",
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
      className={`${inter.variable} ${serifFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F4F7F5] text-slate-800">
        <TooltipProvider>
          {children}
          {/* 2. Ajout du Toaster ici pour rendre les notifications visibles */}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}