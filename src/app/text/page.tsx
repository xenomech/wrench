import type { Metadata } from "next";
import { DiffViewer } from "@/components/tools/diff-viewer";

export const metadata: Metadata = {
  title: "Text Diff",
  description:
    "Compare two texts side by side and see additions, deletions, and changes highlighted inline.",
  alternates: { canonical: "/text" },
};

export default function DiffPage() {
  return <DiffViewer />;
}
