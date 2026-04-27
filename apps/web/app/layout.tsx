import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeighPro",
  description: "Modern weighbridge operations for order-linked vehicle weighing.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
