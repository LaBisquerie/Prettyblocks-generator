import Link from "next/link";
import { BlockLibraryNavItem } from "./sidebar/BlockLibraryNavItem";

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
            <div className="p-3 text-sm text-muted-foreground">
              No saved blocks yet.
            </div>
          ) : (
            <nav className="space-y-1">
              {items.map((item) => (
                <BlockLibraryNavItem
                  key={item.id}
                  id={item.id}
                  nameLabel={item.nameLabel}
                  code={item.code}
                  description={item.description}
                  isActive={item.id === activeId}
                />
              ))}
            </nav>
          )}
        </div>
      </div>
    </aside>
  );
}
