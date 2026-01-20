"use client";

import { useState } from "react";
import type { BlockGeneratorInput } from "@/lib/prettyblocks/block-generator.schema";
import { blockLibraryService } from "@/services/block-library.service";

type UseBlockLibraryReturn = {
  isSaving: boolean;
  saveToLibrary: (input: BlockGeneratorInput) => Promise<{ id: string; code: string }>;
};

export function useBlockLibrary(): UseBlockLibraryReturn {
  const [isSaving, setIsSaving] = useState(false);

  async function saveToLibrary(input: BlockGeneratorInput) {
    setIsSaving(true);

    try {
      return await blockLibraryService.save(input);
    } finally {
      setIsSaving(false);
    }
  }

  return { isSaving, saveToLibrary };
}
