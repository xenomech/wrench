import type { Metadata } from "next";
import { TimeTool } from "@/components/tools/time-tool";

export const metadata: Metadata = {
  title: "Time Converter",
  description:
    "Convert timestamps between Unix, ISO 8601, and human-readable formats. Compare times across time zones.",
  alternates: { canonical: "/time" },
};

export default function TimePage() {
  return <TimeTool />;
}
