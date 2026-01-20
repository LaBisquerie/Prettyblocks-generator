import Link from "next/link";
import { DeleteBlockAction } from "./sidebar/DeleteBlockAction";

type BlockLibrarySidebarItem = {
  id: string;
  nameLabel: string;
  code: string;
  description: string;
};

type BlockLibrarySidebarProps = {
  items: BlockLibrarySidebarItem[];
  activeId?: string;
};

export function BlockLibrarySidebar({ items, activeId }: BlockLibrarySidebarProps) {
  return (
    <aside className="w-full border-r bg-background md:w-80">
      <div className="flex h-full flex-col">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Library</p>

            <Link
              href="/generator"
              className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
            >
              + New block
            </Link>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            Click a block to load its config into the generator.
          </p>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {items.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">No saved blocks yet.</div>
          ) : (
            <nav className="space-y-1">
              {items.map((item) => {
                const isActive = item.id === activeId;

                return (
                  <Link
                    key={item.id}
                    href={`/generator?id=${item.id}`}
                    className={[
                      "block rounded-md border px-3 py-2 text-sm transition",
                      isActive
                        ? "border-primary bg-primary/10"
                        : "border-transparent hover:border-border hover:bg-muted",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.nameLabel}</p>
                        <p className="text-xs text-muted-foreground">{item.code}</p>
                      </div>

                      <DeleteBlockAction blockId={item.id} blockLabel={item.nameLabel} />
                    </div>

                    {item.description ? (
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </aside>
  );
}
