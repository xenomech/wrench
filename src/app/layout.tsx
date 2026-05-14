import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { TabBar } from "@/components/tab-bar";
import { TopBar } from "@/components/top-bar";
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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${jakarta.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
        <Providers>
          <div className="bg-canvas flex h-[100dvh] flex-col overflow-hidden">
            <TopBar />
            <main className="flex min-h-0 flex-1">{children}</main>
            <TabBar />
          </div>
        </Providers>
      </body>
    </html>
  );
}
