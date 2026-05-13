import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { TabBar } from "@/components/tab-bar";
import { Providers } from "@/components/providers";
import "@/styles/globals.scss";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-code",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "WrenchKit",
  description: "Developer tools for JSON, YAML, TOML and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#080808" />
      </head>
      <body className={`${jakarta.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
        <Providers>
          <div className="bg-canvas flex h-screen flex-col overflow-hidden">
            <main className="flex min-h-0 flex-1">{children}</main>
            <TabBar />
            <footer className="shrink-0 pb-2 text-center text-[10px] text-white/15">
              built with <span className="text-red-400/50">&#9829;</span> wrenchkit
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
