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
]);

export function sanitizeSafeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
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

  const looksLikeHtml = /<(p|h2|h3|h4|ul|ol|li|blockquote|strong|em|a|br)\b/i.test(
    rawContent
  );

  if (!looksLikeHtml) {
    const lines = rawContent.replace(/\r\n/g, "\n").split("\n");
    const htmlParts: string[] = [];
    let inList = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        if (inList) {
          htmlParts.push("</ul>");
          inList = false;
        }
        continue;
      }

      if (trimmed.startsWith("### ")) {
        if (inList) {
          htmlParts.push("</ul>");
          inList = false;
        }
        htmlParts.push(`<h3>${applyInlineFormatting(trimmed.slice(4))}</h3>`);
      } else if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
        if (inList) {
          htmlParts.push("</ul>");
          inList = false;
        }
        const text = trimmed.startsWith("## ")
          ? trimmed.slice(3)
          : trimmed.slice(2);
        htmlParts.push(`<h2>${applyInlineFormatting(text)}</h2>`);
      } else if (trimmed.startsWith("> ")) {
        if (inList) {
          htmlParts.push("</ul>");
          inList = false;
        }
        htmlParts.push(
          `<blockquote>${applyInlineFormatting(trimmed.slice(2))}</blockquote>`
        );
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        if (!inList) {
          htmlParts.push("<ul>");
          inList = true;
        }
        htmlParts.push(`<li>${applyInlineFormatting(trimmed.slice(2))}</li>`);
      } else {
        if (inList) {
          htmlParts.push("</ul>");
          inList = false;
        }
        htmlParts.push(`<p>${applyInlineFormatting(trimmed)}</p>`);
      }
    }

    if (inList) {
      htmlParts.push("</ul>");
    }

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
      if (tag === "br" || tag === "hr") {
        return `<${tag} />`;
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
