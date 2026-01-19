import { httpClient } from "./http-client";
import type { BlockGeneratorInput } from "@/lib/prettyblocks/block-generator.schema";

type ZipResponse = Blob;

export const generatorService = {
  async generateZip(input: BlockGeneratorInput): Promise<ZipResponse> {
    const response = await httpClient.post("/api/generator/zip", input, {
      responseType: "blob",
    });

    return response.data;
  },
};
