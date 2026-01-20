import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { blockGeneratorSchema } from "@/lib/prettyblocks/block-generator.schema";

export const runtime = "nodejs";

export async function GET() {
  const items = await prisma.blockLibraryItem.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      blockName: true,
      code: true,
      tplFilename: true,
      nameLabel: true,
      description: true,
      hasRepeater: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();

  const parsed = blockGeneratorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input = parsed.data;

  const item = await prisma.blockLibraryItem.upsert({
    where: { code: input.code },
    update: {
      blockName: input.blockName,
      tplFilename: input.tplFilename,
      nameLabel: input.nameLabel,
      description: input.description,
      tab: input.tab,
      icon: input.icon,
      hasRepeater: input.hasRepeater,
      input: input as unknown as object,
    },
    create: {
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
    select: { id: true, code: true, updatedAt: true },
  });

  return NextResponse.json(item, { status: 201 });
}
