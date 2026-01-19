import JSZip from "jszip";
import { NextResponse } from "next/server";
import { blockGeneratorSchema } from "@/lib/prettyblocks/block-generator.schema";
import { generatePrettyblocksFiles } from "@/lib/prettyblocks/generate-block-files";

export const runtime = "nodejs";

function getZipFilename(tplFilename: string, code: string): string {
  if (tplFilename.endsWith(".tpl")) {
    return tplFilename.replace(/\.tpl$/, ".zip");
  }

  return `${code}.zip`;
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
