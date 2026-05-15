import type { Metadata } from "next";
import { JwtDecoderTool } from "@/components/tools/jwt-decoder";

export const metadata: Metadata = {
  title: "JWT Decoder",
  description:
    "Decode and inspect JSON Web Tokens. View header, payload, and expiration details — nothing leaves your browser.",
  alternates: { canonical: "/encode/jwt" },
};

export default function JwtPage() {
  return <JwtDecoderTool />;
}
