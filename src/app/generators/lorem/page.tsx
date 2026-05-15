import type { Metadata } from "next";
import { LoremGenerator } from "@/components/tools/lorem-generator";

export const metadata: Metadata = {
  title: "Lorem Ipsum Generator",
  description:
    "Generate lorem ipsum placeholder text — paragraphs, sentences, or words. Copy-ready for your designs and mockups.",
  alternates: { canonical: "/generators/lorem" },
};

export default function LoremPage() {
  return <LoremGenerator />;
}
