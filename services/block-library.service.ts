import axios from "axios";
import type { BlockGeneratorInput } from "@/lib/prettyblocks/block-generator.schema";

type LibraryItemSummary = {
  id: string;
  blockName: string;
  code: string;
  tplFilename: string;
  nameLabel: string;
  description: string;
  hasRepeater: boolean;
  createdAt: string;
  updatedAt: string;
};

export const blockLibraryService = {
  async list(): Promise<LibraryItemSummary[]> {
    const res = await axios.get("/api/library/blocks");
    return res.data;
  },

  async save(input: BlockGeneratorInput): Promise<{ id: string; code: string }> {
    const res = await axios.post("/api/library/blocks", input);
    return res.data;
  },

  async downloadZip(id: string): Promise<Blob> {
    const res = await axios.get(`/api/library/blocks/${id}/zip`, {
      responseType: "blob",
    });
    return res.data;
  },

  async deleteById(id: string): Promise<void> {
    await axios.delete(`/api/library/blocks/${id}`);
  }
};
