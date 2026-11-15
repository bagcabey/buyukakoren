const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "h2",
  "h3",
  "h4",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "hr",
  "img",
]);

export function sanitizeSafeUrl(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";

  if (
    trimmed.startsWith("/") &&
    !/^\/[/\\]/.test(trimmed) &&
    !/^\/\\/.test(trimmed) &&
    !trimmed.includes("\\")
  ) {
    try {
      const resolved = new URL(trimmed, "http://localhost");
      if (
        resolved.origin === "http://localhost" &&
        !resolved.pathname.startsWith("//") &&
        !resolved.pathname.includes("\\")
      ) {
        return trimmed;
      }
    } catch {
      return "";
    }
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      if (trimmed.includes("\\")) {
        return "";
      }
      return parsed.toString();
    }
  } catch {
    return "";
  }
  return "";
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function applyInlineFormatting(line: string): string {
  // Escape HTML first if treating as plain text/markdown
  let out = escapeHtml(line);
  // Markdown image ![alt](url) - must precede markdown link to prevent !<a ...>
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, url) => {
    const safe = sanitizeSafeUrl(url);
    if (!safe) return "";
    return `<img src="${escapeHtml(safe)}" alt="${escapeHtml(alt)}" className="my-2 rounded max-w-full" />`;
  });
  // Markdown link [label](url)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => {
    const safe = sanitizeSafeUrl(url);
    if (!safe) return label;
    return `<a href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });
  // Bold **text**
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Italic *text*
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return out;
}

/**
 * Accepts either plain text/markdown OR basic rich HTML produced by the admin editor
 * and outputs sanitized HTML safe for dangerouslySetInnerHTML.
 */
export function renderSafeRichText(rawContent: string): string {
  if (!rawContent || typeof rawContent !== "string") return "";

  const looksLikeHtml = /<(?:p|h2|h3|h4|ul|ol|li|blockquote|strong|em|a|br|hr|img)\b/i.test(
    rawContent
  );

  if (!looksLikeHtml) {
    const lines = rawContent.replace(/\r\n/g, "\n").split("\n");
    const htmlParts: string[] = [];
    let listType: "ul" | "ol" | null = null;

    const closeList = () => {
      if (listType === "ul") {
        htmlParts.push("</ul>");
      } else if (listType === "ol") {
        htmlParts.push("</ol>");
      }
      listType = null;
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        closeList();
        continue;
      }

      // Horizontal separator: --- or *** or ___
      if (/^(?:---|\*\*\*|___|-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        closeList();
        htmlParts.push(`<hr className="my-4 border-[#e6e5e0]" />`);
      } else if (trimmed.startsWith("### ")) {
        closeList();
        htmlParts.push(`<h3>${applyInlineFormatting(trimmed.slice(4))}</h3>`);
      } else if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
        closeList();
        const text = trimmed.startsWith("## ")
          ? trimmed.slice(3)
          : trimmed.slice(2);
        htmlParts.push(`<h2>${applyInlineFormatting(text)}</h2>`);
      } else if (trimmed.startsWith("> ")) {
        closeList();
        htmlParts.push(
          `<blockquote>${applyInlineFormatting(trimmed.slice(2))}</blockquote>`
        );
      } else if (/^\d+\.\s+/.test(trimmed)) {
        if (listType !== "ol") {
          closeList();
          htmlParts.push(`<ol className="my-2 list-decimal pl-6">`);
          listType = "ol";
        }
        const itemContent = trimmed.replace(/^\d+\.\s+/, "");
        htmlParts.push(`<li>${applyInlineFormatting(itemContent)}</li>`);
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        if (listType !== "ul") {
          closeList();
          htmlParts.push("<ul>");
          listType = "ul";
        }
        htmlParts.push(`<li>${applyInlineFormatting(trimmed.slice(2))}</li>`);
      } else {
        closeList();
        // Check for standalone image line: ![alt](url)
        const standaloneImgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (standaloneImgMatch) {
          const safe = sanitizeSafeUrl(standaloneImgMatch[2]);
          if (safe) {
            htmlParts.push(
              `<img src="${escapeHtml(safe)}" alt="${escapeHtml(standaloneImgMatch[1])}" className="my-2 rounded max-w-full" />`
            );
          }
        } else {
          htmlParts.push(`<p>${applyInlineFormatting(trimmed)}</p>`);
        }
      }
    }

    closeList();
    return htmlParts.join("\n");
  }

  // HTML modunda zararlı etiket ve öznitelikleri temizle
  let cleaned = rawContent
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  cleaned = cleaned.replace(
    /<\/?([a-zA-Z0-9]+)(\s[^>]*)?>/g,
    (fullMatch, tagRaw: string, attrs = "") => {
      const tag = tagRaw.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) {
        return "";
      }
      if (fullMatch.startsWith("</")) {
        return `</${tag}>`;
      }
      if (tag === "br") {
        return `<br />`;
      }
      if (tag === "hr") {
        return `<hr className="my-4 border-[#e6e5e0]" />`;
      }
      if (tag === "ol") {
        return `<ol className="my-2 list-decimal pl-6">`;
      }
      if (tag === "img") {
        const srcMatch = attrs.match(/src\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
        const altMatch = attrs.match(/alt\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
        const safeSrc = srcMatch
          ? sanitizeSafeUrl(srcMatch[1] || srcMatch[2] || "")
          : "";
        if (!safeSrc) return "";
        const altText = altMatch
          ? escapeHtml(altMatch[1] || altMatch[2] || "")
          : "";
        return `<img src="${escapeHtml(safeSrc)}" alt="${altText}" className="my-2 rounded max-w-full" />`;
      }
      if (tag === "a") {
        const hrefMatch = attrs.match(/href\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
        const safeHref = hrefMatch
          ? sanitizeSafeUrl(hrefMatch[1] || hrefMatch[2] || "")
          : "";
        if (!safeHref) return `<a href="#gecersiz-baglanti">`;
        return `<a href="${escapeHtml(safeHref)}" target="_blank" rel="noopener noreferrer">`;
      }
      return `<${tag}>`;
    }
  );

  return cleaned;
}
