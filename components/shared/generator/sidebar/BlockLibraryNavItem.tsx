"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { DeleteBlockAction } from "./DeleteBlockAction";

type BlockLibraryNavItemProps = {
  id: string;
  nameLabel: string;
  code: string;
  description: string;
  isActive: boolean;
};

export function BlockLibraryNavItem({ id, nameLabel, code, description, isActive, }: BlockLibraryNavItemProps) {
  const ref = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    ref.current?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    });
  }, [isActive]);

  function handleClick() {
    if (isActive) {
      return;
    }

    toast.success(`Loaded block — ${nameLabel}`);
  }

  return (
    <Link
      ref={ref}
      href={`/generator?id=${id}`}
      onClick={handleClick}
      className={[
        "block rounded-md border px-3 py-2 text-sm transition",
        isActive
          ? "border-primary bg-primary/10"
          : "border-transparent hover:border-border hover:bg-muted",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{nameLabel}</p>
          <p className="text-xs text-muted-foreground">{code}</p>
        </div>

        <DeleteBlockAction blockId={id} blockLabel={nameLabel} />
      </div>

      {description ? (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
    </Link>
  );
}
