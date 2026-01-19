import { z } from "zod";

/**
 * Prettyblocks field types from documentation
 */
export const fieldTypeSchema = z.enum([
  "text",
  "color",
  "textarea",
  "fileupload",
  "selector",
  "editor",
  "checkbox",
  "radio_group",
  "select",
  "multiselect",
  "title",
  "slider",
  "datepicker",
]);

/**
 * Choices can be:
 * - ["h1", "h2", "h3"]
 * - [{ id: "h1", label: "Heading 1" }]
 *
 * We'll normalize during generation.
 */
const fieldChoiceSchema = z.union([
  z.string(),
  z.object({
    id: z.string().min(1),
    label: z.string().min(1),
  }),
]);

const titleDefaultSchema = z.object({
  tag: z.string().min(1).default("h2"),
  classes: z.array(z.string()).default([]),
  value: z.string().default(""),
  focus: z.boolean().default(false),
  bold: z.boolean().default(false),
  italic: z.boolean().default(false),
  underline: z.boolean().default(false),
  size: z.number().int().default(18),
});

/**
 * Base field shared options
 */
const baseFieldSchema = z.object({
  name: z
    .string()
    .min(1, "Field name is required")
    .regex(/^[a-z][a-z0-9_]*$/, "Use snake_case (ex: title, image_alt)"),

  label: z.string().min(1, "Label is required"),

  forceDefaultValue: z.boolean().optional(),
});

const textLikeFieldSchema = baseFieldSchema.extend({
  type: z.enum(["text", "color", "textarea"]),
  defaultValue: z.string().optional(),
});

const fileuploadFieldSchema = baseFieldSchema.extend({
  type: z.literal("fileupload"),
  path: z.string().optional(), // must start with $ in PB, we won't enforce here
  defaultUrls: z.array(z.string()).optional(), // simplified default structure
});

const selectorFieldSchema = baseFieldSchema.extend({
  type: z.literal("selector"),
  collection: z.string().min(1, "collection is required (ex: Product)"),
  selector: z.string().min(1, "selector pattern is required (ex: {id} - {name})"),
});

const editorFieldSchema = baseFieldSchema.extend({
  type: z.literal("editor"),
  provider: z.enum(["vuequill"]).optional(),
  defaultValue: z.string().optional(),
});

const checkboxFieldSchema = baseFieldSchema.extend({
  type: z.literal("checkbox"),
  defaultValue: z.boolean().optional(),
});

const selectFieldSchema = baseFieldSchema.extend({
  type: z.enum(["select", "radio_group"]),
  defaultValue: z.string().optional(),
  choices: z.array(fieldChoiceSchema).optional(),
});

const multiselectFieldSchema = baseFieldSchema.extend({
  type: z.literal("multiselect"),
  defaultValue: z.array(z.string()).optional(),
  choices: z.array(fieldChoiceSchema).optional(),
});

const titleFieldSchema = baseFieldSchema.extend({
  type: z.literal("title"),
  defaultValue: titleDefaultSchema.optional(),
});

const sliderFieldSchema = baseFieldSchema.extend({
  type: z.literal("slider"),
  defaultValue: z.number().optional(),
  step: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});

const datepickerFieldSchema = baseFieldSchema.extend({
  type: z.literal("datepicker"),
  defaultValue: z.string().optional(), // store date as string, ex: "2026-01-19"
});

export const fieldSchema = z.discriminatedUnion("type", [
  textLikeFieldSchema,
  fileuploadFieldSchema,
  selectorFieldSchema,
  editorFieldSchema,
  checkboxFieldSchema,
  selectFieldSchema,
  multiselectFieldSchema,
  titleFieldSchema,
  sliderFieldSchema,
  datepickerFieldSchema,
]);

export const blockGeneratorSchema = z.object({
  blockName: z
    .string()
    .min(1, "Block name is required")
    .regex(/^[A-Z][A-Za-z0-9]*$/, "Use PascalCase (ex: HeroBanner)"),
  tplFilename: z
    .string()
    .min(1, "TPL filename is required")
    .regex(/^[a-z0-9-]+\.tpl$/, "Example: hero-banner.tpl"),
  code: z
    .string()
    .min(1, "Code is required")
    .regex(/^cpb_[a-z0-9_]+$/, "Example: cpb_herobanner"),
  nameLabel: z.string().min(1, "Displayed name is required"),
  description: z.string().min(1, "Description is required"),
  tab: z.string().default("general"),
  icon: z.string().default("DocumentIcon"),
  hasRepeater: z.boolean(),
  fields: z.array(fieldSchema).optional(),
  repeater: z
    .object({
      nameLabel: z.string().min(1, "Repeater label is required"),
      nameFrom: z.string().min(1, "nameFrom is required"),
      fields: z.array(fieldSchema).min(1, "At least one repeater field is required"),
    })
    .optional(),
});

export type BlockGeneratorFormValues = z.input<typeof blockGeneratorSchema>;
export type BlockGeneratorInput = z.output<typeof blockGeneratorSchema>;
export type BlockField = z.infer<typeof fieldSchema>;
export type BlockFieldType = z.infer<typeof fieldTypeSchema>;
