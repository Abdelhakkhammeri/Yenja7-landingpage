import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yenja7 – Pre-register your business",
  description:
    "Yenja7 helps Tunisians in Europe find Tunisian-owned businesses. Pre-register your business before the app launches.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">{children}</body>
    </html>
  );
}
