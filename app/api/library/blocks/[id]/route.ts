import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { blockGeneratorSchema } from "@/lib/prettyblocks/block-generator.schema";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const item = await prisma.blockLibraryItem.findUnique({
    where: { id },
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await req.json();

  const parsed = blockGeneratorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input = parsed.data;

  const updated = await prisma.blockLibraryItem.update({
    where: { id },
    data: {
      blockName: input.blockName,
      code: input.code,
      tplFilename: input.tplFilename,
      nameLabel: input.nameLabel,
      description: input.description,
      tab: input.tab,
      icon: input.icon,
      hasRepeater: input.hasRepeater,
      input: input as unknown as object,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  await prisma.blockLibraryItem.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
