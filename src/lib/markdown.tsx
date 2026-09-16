/**
 * @file src/lib/markdown.tsx
 * @description Markdown parser, auto-formatting engine, and inline rich text renderer for GoCoupon blogs.
 */

import React from "react";
import type { PostSection } from "@/data/posts";

/**
 * Normalizes and formats pasted article text to fix broken markdown,
 * collapsed tables, merged lists, and irregular spacing.
 */
export function autoFormatMarkdown(raw: string): string {
  if (!raw) return "";

  let text = raw
    // Normalize line endings
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Replace non-breaking spaces with standard spaces
    .replace(/\u00A0/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");

  // 1. Fix collapsed markdown tables where multiple rows are stuck on a single line
  // Example: "| col1 | col2 | |--|--| | row1 | row2 |" -> breaks onto separate lines
  text = text.replace(/(\|)\s*(\|--[^\n|]*\|)\s*(\|)/g, "$1\n$2\n$3");
  text = text.replace(/(\|)\s*(\|[ \t]*\*\*?[A-Za-z0-9])/g, "$1\n$2");
  text = text.replace(/(\|)\s*(\|[ \t]*`?[A-Za-z0-9])/g, "$1\n$2");

  // 2. Fix collapsed numbered lists merged onto one line
  // Example: "1. Step one. 2. Step two. 3. Step three." -> breaks onto separate lines
  text = text.replace(/([^\n])\s+(\d+\.\s+)/g, "$1\n$2");

  // 3. Fix collapsed bullet points
  // Example: "• Point one • Point two" -> "- Point one\n- Point two"
  text = text.replace(/([^\n])\s+([•–—*]\s+)/g, "$1\n- ");
  text = text.replace(/^[•–—*]\s+/gm, "- ");

  // 4. Normalize headings: ensure a space after # and blank lines before headings
  text = text.replace(/^(#{1,6})([^\s#])/gm, "$1 $2");
  text = text.replace(/([^\n])\n(#{1,6}\s+)/g, "$1\n\n$2");

  // 5. Normalize horizontal dividers (---, ***, or lone --)
  text = text.replace(/^[ \t]*--[ \t]*$/gm, "---");
  text = text.replace(/([^\n])\n(---|\*\*\*)\n([^\n])/g, "$1\n\n$2\n\n$3");

  // 6. Fix table surroundings (ensure blank lines before and after table blocks)
  const lines = text.split("\n");
  const formattedLines: string[] = [];
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isTableRow = line.trim().startsWith("|") && line.trim().endsWith("|");

    if (isTableRow && !inTable) {
      if (formattedLines.length > 0 && formattedLines[formattedLines.length - 1].trim() !== "") {
        formattedLines.push("");
      }
      inTable = true;
    } else if (!isTableRow && inTable) {
      inTable = false;
      if (line.trim() !== "") {
        formattedLines.push("");
      }
    }

    formattedLines.push(line);
  }

  text = formattedLines.join("\n");

  // 7. Collapse excessive consecutive blank lines (3+ newlines -> 2 newlines)
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}

/**
 * Parses raw markdown article content into structured PostSection[] items
 * with support for tables, callouts, lists, headers, images, code, and dividers.
 */
export function parseMarkdownToSections(content: string): PostSection[] {
  if (!content || !content.trim()) return [];

  // Normalize input first
  const cleanText = autoFormatMarkdown(content);
  const rawBlocks = cleanText.split(/\n{2,}/);
  const sections: PostSection[] = [];

  for (let bIndex = 0; bIndex < rawBlocks.length; bIndex++) {
    const block = rawBlocks[bIndex].trim();
    if (!block) continue;

    // 1. Horizontal rule
    if (/^(---|\*\*\*|___)$/.test(block) || block === "--") {
      sections.push({ type: "hr" });
      continue;
    }

    // 2. Headings
    if (block.startsWith("## ")) {
      sections.push({ type: "h2", text: block.replace(/^##\s+/, "").trim() });
      continue;
    }
    if (block.startsWith("### ")) {
      sections.push({ type: "h3", text: block.replace(/^###\s+/, "").trim() });
      continue;
    }
    if (block.startsWith("# ")) {
      sections.push({ type: "h2", text: block.replace(/^#\s+/, "").trim() });
      continue;
    }

    // 3. Standalone Image
    const imgMatch = block.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      sections.push({
        type: "image",
        caption: imgMatch[1] || "",
        url: imgMatch[2],
        alt: imgMatch[1] || "",
      });
      continue;
    }

    // 4. Code Block
    if (block.startsWith("```") && block.endsWith("```")) {
      const codeLines = block.split("\n");
      const firstLine = codeLines[0].replace(/^```/, "").trim();
      const codeBody = codeLines.slice(1, -1).join("\n");
      sections.push({
        type: "code",
        language: firstLine || "bash",
        code: codeBody,
      });
      continue;
    }

    // 5. Callout or Blockquote (> ...)
    if (block.startsWith(">")) {
      const quoteLines = block.split("\n").map((l) => l.replace(/^>\s?/, "").trim());
      const fullQuote = quoteLines.join("\n");

      // Check for GitHub Alerts: > [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT]
      const alertMatch = fullQuote.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?([\s\S]*)$/i);
      if (alertMatch) {
        const alertType = alertMatch[1].toUpperCase();
        let body = alertMatch[2].trim();
        let title = "";

        // Extract title if present (e.g. **Verified Promo Verdict...:**)
        const boldTitleMatch = body.match(/^\*\*([^*]+)\*\*[:\s]*\n?([\s\S]*)$/);
        if (boldTitleMatch) {
          title = boldTitleMatch[1].replace(/[:\s]+$/, "");
          body = boldTitleMatch[2].trim();
        }

        const variant: "info" | "warning" | "success" =
          alertType === "WARNING" || alertType === "CAUTION"
            ? "warning"
            : alertType === "TIP" || alertType === "IMPORTANT"
            ? "success"
            : "info";

        sections.push({
          type: "callout",
          title: title || `${alertType.charAt(0) + alertType.slice(1).toLowerCase()} Notice`,
          text: body,
          variant,
        });
        continue;
      }

      // Generic Quote or Callout
      sections.push({
        type: "quote",
        text: fullQuote,
      });
      continue;
    }

    // 6. Markdown Table
    // Detect if lines start and end with '|' and contain a separator row
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const isTable =
      lines.length >= 2 &&
      lines.every((l) => l.startsWith("|") && l.endsWith("|")) &&
      lines.some((l) => /^\|(\s*:?-+:?\s*\|)+$/.test(l));

    if (isTable) {
      const headerLine = lines[0];
      const separatorIndex = lines.findIndex((l) => /^\|(\s*:?-+:?\s*\|)+$/.test(l));
      
      const headers = headerLine
        .split("|")
        .slice(1, -1)
        .map((h) => h.trim());

      const dataLines = separatorIndex !== -1
        ? lines.slice(separatorIndex + 1)
        : lines.slice(1);

      const rows = dataLines.map((row) =>
        row
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim())
      );

      if (headers.length > 0 && rows.length > 0) {
        sections.push({
          type: "table",
          headers,
          rows,
        });
        continue;
      }
    }

    // 7. Numbered List (Ordered List)
    const isOrderedList = lines.every((l) => /^\d+\.\s+/.test(l));
    if (isOrderedList && lines.length > 0) {
      const items = lines.map((l) => l.replace(/^\d+\.\s+/, "").trim());
      sections.push({
        type: "ol",
        items,
      });
      continue;
    }

    // 8. Bulleted List (Unordered List)
    const isUnorderedList = lines.every((l) => /^[-*•]\s+/.test(l));
    if (isUnorderedList && lines.length > 0) {
      const items = lines.map((l) => l.replace(/^[-*•]\s+/, "").trim());
      sections.push({
        type: "ul",
        items,
      });
      continue;
    }

    // 9. Mixed List or Multi-line Paragraph
    // If block starts with a list item but has descriptions
    if (/^\d+\.\s+/.test(lines[0]) && lines.some((l) => /^\d+\.\s+/.test(l))) {
      const items: string[] = [];
      let currentItem = "";

      for (const line of lines) {
        if (/^\d+\.\s+/.test(line)) {
          if (currentItem) items.push(currentItem);
          currentItem = line.replace(/^\d+\.\s+/, "").trim();
        } else {
          currentItem += " " + line;
        }
      }
      if (currentItem) items.push(currentItem);

      if (items.length > 1) {
        sections.push({ type: "ol", items });
        continue;
      }
    }

    // 10. Default: Paragraph
    sections.push({
      type: "p",
      text: block,
    });
  }

  return sections;
}

/**
 * Parses inline markdown tokens (**bold**, *italic*, `code`, and [link](url))
 * into rich, styled React elements.
 */
export function FormattedText({ text }: { text: string }) {
  if (!text) return null;

  // Regex to match markdown links, inline code, bold, and italic
  const tokenRegex = /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(tokenRegex);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;

        // 1. Markdown link: [Anchor text](https://...)
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
          const label = linkMatch[1];
          const href = linkMatch[2].trim();
          const isExternal = href.startsWith("http://") || href.startsWith("https://");

          return (
            <a
              key={index}
              href={href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="text-primary font-semibold underline underline-offset-3 hover:text-primary/80 transition-colors"
            >
              <FormattedText text={label} />
            </a>
          );
        }

        // 2. Inline Code: `CODE`
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          const codeContent = part.slice(1, -1);
          return (
            <code
              key={index}
              className="rounded-md bg-muted/90 border border-border/60 px-1.5 py-0.5 font-mono text-xs font-bold text-primary inline-block mx-0.5"
            >
              {codeContent}
            </code>
          );
        }

        // 3. Bold: **TEXT**
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          const boldContent = part.slice(2, -2);
          return (
            <strong key={index} className="font-bold text-foreground">
              <FormattedText text={boldContent} />
            </strong>
          );
        }

        // 4. Italic: *TEXT*
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          const italicContent = part.slice(1, -1);
          return (
            <em key={index} className="italic text-foreground/95">
              <FormattedText text={italicContent} />
            </em>
          );
        }

        // Standard plain text
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
}
