import type { Metadata } from "next";
import { Space_Mono, Inter, Caveat } from "next/font/google";
import "./globals.css";
import "./competitor.css";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-space-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mixtape for You — Send a Personalized Mixtape",
  description:
    "Create and send a beautiful digital mixtape with your favorite songs, a personal note, and a custom cassette design. A unique digital gift for someone special.",
  openGraph: {
    title: "Mixtape for You",
    description: "Send a personalized digital mixtape.",
    siteName: "Mixtape for You",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceMono.variable} ${inter.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
