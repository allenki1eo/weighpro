import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeighPro",
  description: "Modern weighbridge operations for company-wide vehicle movements.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
