"use client";

import { useState } from "react";
import type { BlockGeneratorInput } from "@/lib/prettyblocks/block-generator.schema";
import { generatorService } from "@/services/generator.service";

type UseBlockGeneratorReturn = {
  isGenerating: boolean;
  generate: (input: BlockGeneratorInput) => Promise<void>;
};

function getZipFilename(input: BlockGeneratorInput): string {
  if (input.tplFilename.endsWith(".tpl")) {
    return input.tplFilename.replace(/\.tpl$/, ".zip");
  }

  return `${input.code}.zip`;
}

export function useBlockGenerator(): UseBlockGeneratorReturn {
  const [isGenerating, setIsGenerating] = useState(false);

  async function generate(input: BlockGeneratorInput) {
    setIsGenerating(true);

    try {
      const zipBlob = await generatorService.generateZip(input);

      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement("a");

      link.href = url;
      link.download = getZipFilename(input);
      link.click();

      window.URL.revokeObjectURL(url);
    } finally {
      setIsGenerating(false);
    }
  }

  return { isGenerating, generate };
}
