"use client";

import { blockLibraryService } from "@/services/block-library.service";
import { useState } from "react";

type UseDeleteLibraryBlockReturn = {
  isDeleting: boolean;
  deleteBlock: (id: string) => Promise<void>;
};

export function useDeleteLibraryBlock(): UseDeleteLibraryBlockReturn {
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteBlock(id: string) {
    setIsDeleting(true);

    try {
      await blockLibraryService.deleteById(id);
    } finally {
      setIsDeleting(false);
    }
  }

  return { isDeleting, deleteBlock };
}
