import type { Metadata } from "next";
import { UrlEncodeTool } from "@/components/tools/url-encode";

export const metadata: Metadata = {
  title: "URL Encoder/Decoder",
  description:
    "Encode and decode URLs and query parameters. Handle percent-encoding for special characters instantly.",
  alternates: { canonical: "/encode/url" },
};

export default function UrlPage() {
  return <UrlEncodeTool />;
}
