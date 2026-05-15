import type { Metadata } from "next";
import { Base64Tool } from "@/components/tools/base64";

export const metadata: Metadata = {
  title: "Base64 Encoder/Decoder",
  description:
    "Encode and decode Base64 strings instantly. Supports text and file input — runs entirely in your browser.",
  alternates: { canonical: "/encode" },
};

export default function Base64Page() {
  return <Base64Tool />;
}
