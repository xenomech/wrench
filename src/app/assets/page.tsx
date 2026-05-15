import type { Metadata } from "next";
import { FaviconTool } from "@/components/tools/favicon-tool";

export const metadata: Metadata = {
  title: "Favicon Generator",
  description:
    "Generate favicons and app icons from text, emoji, or images. Download a complete icon set for your website.",
  alternates: { canonical: "/assets" },
};

export default function AssetsPage() {
  return <FaviconTool />;
}
