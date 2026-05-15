import type { Metadata } from "next";
import { JsonWorkspace } from "@/components/tools/json-workspace";

export const metadata: Metadata = {
  title: "JSON Workspace",
  description:
    "Format, validate, and transform JSON, YAML, and TOML. Syntax highlighting, error detection, and conversion between formats.",
  alternates: { canonical: "/json" },
};

export default function JsonPage() {
  return <JsonWorkspace />;
}
