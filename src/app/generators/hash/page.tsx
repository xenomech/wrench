import type { Metadata } from "next";
import { HashGenerator } from "@/components/tools/hash-generator";

export const metadata: Metadata = {
  title: "Hash Generator",
  description:
    "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text input. Fast, private, browser-based hashing.",
  alternates: { canonical: "/generators/hash" },
};

export default function HashPage() {
  return <HashGenerator />;
}
