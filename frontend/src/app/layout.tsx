import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LinkButton from "@/components/ui/link-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shared Whiteboard App",
  description: "Shared whiteboard app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="fixed top-2 right-2 flex flex-row space-x-3">
          <LinkButton link="/">
            Log in
          </LinkButton>
          <LinkButton link="/">
            Sign up
          </LinkButton>
        </div>
        {children}
      </body>
    </html>
  );
}
