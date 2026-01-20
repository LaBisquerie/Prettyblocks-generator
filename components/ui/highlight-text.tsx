import type { ReactNode } from "react";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function highlightText(text: string, query: string): ReactNode {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return text;
  }

  const safe = escapeRegExp(trimmed);
  const regex = new RegExp(`(${safe})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    const isMatch = part.toLowerCase() === trimmed.toLowerCase();

    if (!isMatch) {
      return <span key={index}>{part}</span>;
    }

    return (
      <mark
        key={index}
        className="rounded bg-yellow-200/60 px-1 text-foreground dark:bg-yellow-400/20"
      >
        {part}
      </mark>
    );
  });
}
