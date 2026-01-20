"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { DeleteBlockAction } from "./DeleteBlockAction";
import { highlightText } from "@/components/ui/highlight-text";

type SidebarItem = {
  id: string;
  nameLabel: string;
  code: string;
  description: string;
};

type BlockLibrarySidebarClientProps = {
  items: SidebarItem[];
  activeId?: string;
};

type MatchableItem = SidebarItem & {
  searchable: string;
};

function buildSearchable(item: SidebarItem): string {
  return `${item.nameLabel} ${item.code} ${item.description}`.toLowerCase();
}

export function BlockLibrarySidebarClient({
  items,
  activeId,
}: BlockLibrarySidebarClientProps) {
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [query, setQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isListFocusActive, setIsListFocusActive] = useState(false);

  const indexedItems = useMemo<MatchableItem[]>(
    () =>
      items.map((item) => ({
        ...item,
        searchable: buildSearchable(item),
      })),
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) {
      return indexedItems;
    }

    return indexedItems.filter((item) => item.searchable.includes(q));
  }, [indexedItems, query]);

  useEffect(() => {
    setFocusedIndex(0);
  }, [query]);

  useEffect(() => {
    if (filtered.length === 0) {
      setFocusedIndex(0);
      return;
    }

    setFocusedIndex((prev) => Math.min(prev, filtered.length - 1));
  }, [filtered.length]);

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const target = event.target as Node | null;
      if (target && container.contains(target)) {
        return;
      }

      setIsListFocusActive(false);
    }

    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  function navigateTo(item: SidebarItem) {
    if (item.id === activeId) {
      return;
    }

    toast.success(`Loaded block — ${item.nameLabel}`);
    router.push(`/generator?id=${item.id}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (filtered.length === 0) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsListFocusActive(true);
      setFocusedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setIsListFocusActive(true);
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      setIsListFocusActive(false);

      const item = filtered[focusedIndex];
      if (item) {
        navigateTo(item);
      }
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setQuery("");
      setIsListFocusActive(false);
    }
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-2 p-2">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Filter blocks..."
        className="h-9"
        onFocus={() => setIsListFocusActive(false)}
      />

      <div className="px-1 text-xs text-muted-foreground">
        {filtered.length} / {items.length} blocks
      </div>

      <div className="space-y-1">
        {filtered.length === 0 ? (
          <div className="rounded-md border p-3 text-sm text-muted-foreground">
            No results.
          </div>
        ) : (
          filtered.map((item, index) => (
            <BlockLibraryListItem
              key={item.id}
              item={item}
              query={query}
              isActive={item.id === activeId}
              isFocused={isListFocusActive && index === focusedIndex}
              onNavigate={() => {
                setIsListFocusActive(false);
                navigateTo(item);
              }}
              onMouseEnter={() => {
                setIsListFocusActive(false);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

type BlockLibraryListItemProps = {
  item: SidebarItem;
  query: string;
  isActive: boolean;
  isFocused: boolean;
  onNavigate: () => void;
  onMouseEnter: () => void;
};

function BlockLibraryListItem({
  item,
  query,
  isActive,
  isFocused,
  onNavigate,
  onMouseEnter,
}: BlockLibraryListItemProps) {
  useEffect(() => {
    if (!isFocused) {
      return;
    }

    const el = document.getElementById(`sidebar-item-${item.id}`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [isFocused, item.id]);

  return (
    <div
      id={`sidebar-item-${item.id}`}
      role="button"
      tabIndex={0}
      onClick={onNavigate}
      onMouseEnter={onMouseEnter}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onNavigate();
        }
      }}
      className={[
        "w-full cursor-pointer rounded-md border px-3 py-2 text-left text-sm transition outline-none border-primary/10",
        isActive
          ? "border-primary bg-muted"
          : "bhover:border-border hover:bg-muted",
        isFocused ? "border-black!" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">
            {highlightText(item.nameLabel, query)}
          </p>
          <p className="text-xs text-muted-foreground">
            {highlightText(item.code, query)}
          </p>
        </div>

        <DeleteBlockAction blockId={item.id} blockLabel={item.nameLabel} />
      </div>

      {item.description ? (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
          {highlightText(item.description, query)}
        </p>
      ) : null}
    </div>
  );
}
