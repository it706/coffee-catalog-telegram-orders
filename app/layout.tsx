import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Valery's Coffee | Интернет-магазин кофе",
  description: "Интернет-магазин премиального кофе и аксессуаров для дома и офиса.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
