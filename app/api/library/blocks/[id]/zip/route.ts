import JSZip from "jszip";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { blockGeneratorSchema } from "@/lib/prettyblocks/block-generator.schema";
import { generatePrettyblocksFiles } from "@/lib/prettyblocks/generate-block-files";

export const runtime = "nodejs";

function getZipFilename(tplFilename: string, code: string): string {
  if (tplFilename.endsWith(".tpl")) {
    return tplFilename.replace(/\.tpl$/, ".zip");
  }
  return `${code}.zip`;
}

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

  const parsed = blockGeneratorSchema.safeParse(item.input);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Saved config is invalid", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const files = generatePrettyblocksFiles(parsed.data);

  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.filename, file.content);
  }

  const zipArrayBuffer = await zip.generateAsync({ type: "arraybuffer" });
  const filename = getZipFilename(parsed.data.tplFilename, parsed.data.code);

  return new NextResponse(zipArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
