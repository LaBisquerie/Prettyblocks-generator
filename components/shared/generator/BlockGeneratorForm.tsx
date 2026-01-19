"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import {
  blockGeneratorSchema,
  type BlockGeneratorFormValues,
} from "@/lib/prettyblocks/block-generator.schema";

import { useBlockGenerator } from "@/hooks/use-block-generator";
import { FieldArrayEditor } from "./fields/FieldArrayEditor";

export function BlockGeneratorForm() {
  const { isGenerating, generate } = useBlockGenerator();

  // ✅ no default values (only placeholders)
  const defaultValues = useMemo<BlockGeneratorFormValues>(
    () => ({
      blockName: "",
      tplFilename: "",
      code: "",
      nameLabel: "",
      description: "",
      hasRepeater: false,

      // ✅ block can have config fields + repeater fields at the same time
      fields: [],

      // ✅ only created when repeater is enabled
      repeater: undefined,
    }),
    []
  );

  const form = useForm<BlockGeneratorFormValues>({
    resolver: zodResolver(blockGeneratorSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const hasRepeater = form.watch("hasRepeater");

  function handleRepeaterToggle(nextValue: boolean) {
    form.setValue("hasRepeater", nextValue);

    if (nextValue) {
      // ✅ ensure the repeater object exists so register() works
      const current = form.getValues("repeater");
      if (!current) {
        form.setValue("repeater", {
          nameLabel: "",
          nameFrom: "",
          fields: [],
        });
      }
      return;
    }

    // ✅ disable repeater => remove it
    form.setValue("repeater", undefined);
  }

  async function onSubmit(values: BlockGeneratorFormValues) {
    // ✅ tab/icon are fixed here (no UI)
    const parsed = blockGeneratorSchema.parse({
      ...values,
      tab: "general",
      icon: "DocumentIcon",

      repeater: values.hasRepeater
        ? values.repeater ?? {
            nameLabel: "",
            nameFrom: "Item",
            fields: [],
          }
        : undefined,
    });

    await generate(parsed);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Block basics</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="blockName">Class name (PascalCase)</Label>
              <Input
                id="blockName"
                {...form.register("blockName")}
                placeholder="HeroBanner"
              />
              {form.formState.errors.blockName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.blockName.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="code">Prettyblocks code</Label>
              <Input
                id="code"
                {...form.register("code")}
                placeholder="cpb_herobanner"
              />
              {form.formState.errors.code && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.code.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="tplFilename">TPL filename</Label>
              <Input
                id="tplFilename"
                {...form.register("tplFilename")}
                placeholder="hero-banner.tpl"
              />
              {form.formState.errors.tplFilename && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.tplFilename.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="nameLabel">Displayed name</Label>
              <Input
                id="nameLabel"
                {...form.register("nameLabel")}
                placeholder="Hero Banner"
              />
              {form.formState.errors.nameLabel && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.nameLabel.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Display a hero banner with image + title"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* ✅ tab + icon locked */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Tab</Label>
              <Input value="general" disabled />
            </div>

            <div className="space-y-1">
              <Label>Icon</Label>
              <Input value="DocumentIcon" disabled />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Repeater</p>
              <p className="text-sm text-muted-foreground">
                Enable if your block contains multiple items (states)
              </p>
            </div>

            <Switch checked={hasRepeater} onCheckedChange={handleRepeaterToggle} />
          </div>
        </CardContent>
      </Card>

      {/* ✅ Always show config fields */}
      <Card>
        <CardHeader>
          <CardTitle>Config fields (config.fields)</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <FieldArrayEditor
            title="Block fields"
            control={form.control}
            register={form.register}
            name="fields"
          />
        </CardContent>
      </Card>

      {/* ✅ If repeater enabled, show repeater fields too */}
      {hasRepeater && (
        <Card>
          <CardHeader>
            <CardTitle>Repeater fields (repeater.groups)</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="repeaterNameLabel">Repeater label</Label>
                <Input
                  id="repeaterNameLabel"
                  {...form.register("repeater.nameLabel")}
                  placeholder="List item"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="repeaterNameFrom">nameFrom</Label>
                <Input
                  id="repeaterNameFrom"
                  {...form.register("repeater.nameFrom")}
                  placeholder="Item"
                />
              </div>
            </div>

            <FieldArrayEditor
              title="Repeater fields"
              control={form.control}
              register={form.register}
              name="repeater.fields"
            />
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate ZIP"}
        </Button>
      </div>
    </form>
  );
}
