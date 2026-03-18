import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Dhrumil Amin — Full-Stack Engineer",
  description:
    "Interactive terminal portfolio showcasing full-stack engineering skills, projects, and experience.",
  keywords: [
    "software engineer",
    "full-stack developer",
    "portfolio",
    "terminal",
    "react",
    "next.js",
    "typescript",
  ],
  authors: [{ name: "Dhrumil Amin" }],
  openGraph: {
    title: "Dhrumil Amin — Full-Stack Engineer",
    description: "Interactive terminal portfolio",
    type: "website",
    url: "https://github.com/dhrumil246",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dhrumil Amin — Full-Stack Engineer",
    description: "Interactive terminal portfolio",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}