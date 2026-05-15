import type { Metadata } from "next";
import { MarkdownPreview } from "@/components/tools/markdown-preview";

export const metadata: Metadata = {
  title: "Markdown Preview",
  description:
    "Write and preview Markdown in real time. Supports GitHub Flavored Markdown with live rendering.",
  alternates: { canonical: "/text/markdown" },
};

export default function MarkdownPage() {
  return <MarkdownPreview />;
}
