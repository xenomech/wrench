import type { Metadata } from "next";
import { HtmlEntitiesTool } from "@/components/tools/html-entities";

export const metadata: Metadata = {
  title: "HTML Entity Encoder/Decoder",
  description:
    "Encode and decode HTML entities. Convert special characters to their HTML entity equivalents and back.",
  alternates: { canonical: "/encode/html" },
};

export default function HtmlPage() {
  return <HtmlEntitiesTool />;
}
