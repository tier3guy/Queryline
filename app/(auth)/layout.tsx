import "@/app/globals.css";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Queryline — AI-Powered Database Client",
    template: "%s | Queryline",
  },
  description:
    "Queryline is an AI-powered database client that lets you connect, explore, and query your databases using natural language.",
  applicationName: "Queryline",
  keywords: [
    "Queryline",
    "AI Database Client",
    "Database Management",
    "SQL Editor",
    "Natural Language SQL",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
  ],
  authors: [{ name: "Queryline" }],
  openGraph: {
    title: "Queryline — AI-Powered Database Client",
    description:
      "Connect, explore, and query your databases using natural language.",
    siteName: "Queryline",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Queryline — AI-Powered Database Client",
    description:
      "Your databases. Your queries. Powered by AI.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.className)}
    >
      <body className="min-h-full flex flex-col">
        {/* <ClerkProvider> */}
          {children}
        {/* </ClerkProvider> */}
      </body>
    </html>
  );
}