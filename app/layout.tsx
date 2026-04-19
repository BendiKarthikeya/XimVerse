import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "XIMVERSE — Export Documentation Suite",
  description: "Upload Docs → OCR → Auto Fill Templates → Download PDFs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ background: "#0f172a" }}>
        {children}
      </body>
    </html>
  );
}
