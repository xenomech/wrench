"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, FileCode, Trash } from "@phosphor-icons/react";
import { marked } from "marked";
import { ToolbarButton } from "@/components/toolbar-button";
import { useToast } from "@/components/toast";

const SAMPLE_MARKDOWN = `# Hello World

This is a **Markdown** preview tool.

## Features

- Live preview as you type
- GitHub-flavored markdown
- Copy rendered HTML

### Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Table

| Feature | Status |
|---------|--------|
| Bold    | Done   |
| Links   | Done   |
| Tables  | Done   |

> "The best way to predict the future is to invent it." — Alan Kay
`;

export function MarkdownPreview() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const html = useMemo(() => {
    if (!input.trim()) return "";
    try {
      return marked.parse(input, { gfm: true, breaks: true }) as string;
    } catch {
      return "<p>Error parsing markdown</p>";
    }
  }, [input]);

  const hasPreview = html.length > 0;

  const handleCopy = useCallback(async () => {
    if (!html) return;
    await navigator.clipboard.writeText(html);
    setCopied(true);
    toast("success", "HTML copied");
    setTimeout(() => setCopied(false), 2000);
  }, [html, toast]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-2">
        <ToolbarButton onClick={() => setInput(SAMPLE_MARKDOWN)}>
          <FileCode weight="duotone" className="h-4 w-4" /> Sample
        </ToolbarButton>
        {input.trim() && (
          <ToolbarButton onClick={() => setInput("")}>
            <Trash weight="duotone" className="h-4 w-4" /> Clear
          </ToolbarButton>
        )}
        {hasPreview && (
          <ToolbarButton onClick={handleCopy}>
            {copied ? (
              <Check weight="duotone" className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy weight="duotone" className="h-4 w-4" />
            )}
            {copied ? "Copied HTML" : "Copy HTML"}
          </ToolbarButton>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <motion.div
          className="flex min-h-[150px] flex-col gap-2 md:min-h-[200px] lg:min-h-[300px]"
          layout
          animate={{ flex: hasPreview ? "1 1 0%" : "1 1 100%" }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="text-xs font-medium uppercase tracking-wider text-white/35">
            Markdown
          </span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write or paste Markdown here..."
            className="font-code placeholder:text-white/22 flex-1 resize-none rounded-xl bg-black/20 p-4 text-sm leading-relaxed text-white/90 outline-none focus:ring-1 focus:ring-white/10"
          />
        </motion.div>

        <AnimatePresence>
          {hasPreview && (
            <motion.div
              className="flex min-h-[150px] min-w-0 flex-col gap-2 overflow-hidden md:min-h-[200px] lg:min-h-[300px]"
              initial={{ flex: "0 0 0%", opacity: 0 }}
              animate={{ flex: "1 1 0%", opacity: 1 }}
              exit={{ flex: "0 0 0%", opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <span className="text-xs font-medium uppercase tracking-wider text-white/35">
                Preview
              </span>
              <div className="flex-1 overflow-auto rounded-xl bg-black/15 p-4">
                <div
                  className="prose prose-sm prose-invert prose-headings:text-white/90 prose-p:text-white/60 prose-a:text-blue-400 prose-strong:text-white/80 prose-code:text-violet-400 prose-pre:bg-white/[0.06] prose-blockquote:border-white/10 prose-blockquote:text-white/40 prose-th:text-white/50 prose-td:text-white/40 prose-hr:border-white/10 max-w-none"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
