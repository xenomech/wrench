import type { Metadata } from "next";
import { ScreenshotTool } from "@/components/tools/screenshot-tool";

export const metadata: Metadata = {
  title: "Screenshot Mockup",
  description:
    "Wrap screenshots in device frames — browser, phone, or tablet. Customize background, padding, and export as PNG.",
  alternates: { canonical: "/assets/screenshots" },
};

export default function ScreenshotsPage() {
  return <ScreenshotTool />;
}
