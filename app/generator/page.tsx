import { BlockGeneratorForm } from "@/components/shared/generator/BlockGeneratorForm";
import { BlockGeneratorFormValues, blockGeneratorSchema } from "@/lib/prettyblocks/block-generator.schema";
import { prisma } from "@/lib/db/prisma";
import { BlockLibrarySidebar } from "@/components/shared/generator/BlockLibrarySidebar";

type GeneratorPageProps = {
  searchParams: Promise<{ id?: string }>;
};

export const dynamic = "force-dynamic";

function mapToFormValues(input: unknown): BlockGeneratorFormValues | undefined {
  const parsed = blockGeneratorSchema.safeParse(input);

  if (!parsed.success) {
    return undefined;
  }

  const value = parsed.data;

  return {
    blockName: value.blockName,
    tplFilename: value.tplFilename,
    code: value.code,
    nameLabel: value.nameLabel,
    description: value.description,
    hasRepeater: value.hasRepeater,
    fields: value.fields ?? [],
    repeater: value.repeater,
  }
}

export default async function GeneratorPage(props: GeneratorPageProps) {
  const { id } = await props.searchParams;

  const items = await prisma.blockLibraryItem.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      nameLabel: true,
      code: true,
      description: true,
    },
  });

  const selectedItem = id ? await prisma.blockLibraryItem.findUnique({
    where: { id },
    select: { id: true, input: true },
  }) : null;

  const initialValues = selectedItem ? mapToFormValues(selectedItem.input) : undefined;

  return (
    <div className="flex min-h-[calc(100vh-0px)]" suppressHydrationWarning>
      <BlockLibrarySidebar items={items} activeId={id} />

      <main className="flex-1 p-6">
        <BlockGeneratorForm key={id ?? "new"} initialValues={initialValues} />
      </main>
    </div>
  );
}
