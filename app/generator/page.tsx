import { BlockGeneratorForm } from "@/components/shared/generator/BlockGeneratorForm";

export default function GeneratorPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Prettyblocks Block Generator</h1>
        <p className="text-muted-foreground">
          Create a PHP + TPL scaffold and download it as a zip.
        </p>
      </div>

      <div className="mt-8">
        <BlockGeneratorForm />
      </div>
    </main>
  );
}
