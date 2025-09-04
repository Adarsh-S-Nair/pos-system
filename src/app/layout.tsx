import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./colors.css";

const geistSans = Manrope({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["200","300","400","500","600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crate",
  description: "Crate – Modern POS for sales and inventory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--color-bg)] text-[var(--color-fg)]`}>
        {children}
      </body>
    </html>
  );
}
