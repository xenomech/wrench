import type { Metadata } from "next";
import { UuidGenerator } from "@/components/tools/uuid-generator";

export const metadata: Metadata = {
  title: "UUID Generator",
  description:
    "Generate UUIDs (v4) instantly. Copy single or bulk UUIDs for your projects — runs entirely in your browser.",
  alternates: { canonical: "/generators" },
};

export default function UuidPage() {
  return <UuidGenerator />;
}
