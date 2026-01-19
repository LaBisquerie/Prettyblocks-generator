import type { BlockField, BlockGeneratorInput } from "./block-generator.schema";

type GeneratedFile = {
  filename: string;
  content: string;
};

export function generatePrettyblocksFiles(input: BlockGeneratorInput): GeneratedFile[] {
  const phpClassName = `${input.blockName}Block`;

  const phpContent = buildPhpFile({
    className: phpClassName,
    input,
  });

  const tplContent = input.hasRepeater
    ? buildRepeaterTplFile(input)
    : buildSimpleTplFile(input);

  return [
    { filename: `${phpClassName}.php`, content: phpContent },
    { filename: input.tplFilename, content: tplContent },
  ];
}

function buildPhpFile(args: { className: string; input: BlockGeneratorInput }): string {
  const { className, input } = args;
  const sections: string[] = [];

  // config.fields
  const configFields = buildFieldsPhp(input.fields ?? []);
  if ((input.fields ?? []).length > 0) {
    sections.push(buildConfigPhp(configFields));
  }

  // repeater.groups
  if (input.hasRepeater && input.repeater) {
    const repeaterFields = buildFieldsPhp(input.repeater.fields ?? []);
    sections.push(
      buildRepeaterPhp({
        repeaterNameLabel: input.repeater.nameLabel,
        nameFrom: input.repeater.nameFrom,
        groupsPhp: repeaterFields,
      })
    );
  }

  const definitionTail = sections.join("\n");

  return `<?php
/**
 * Copyright since 2002 Creabilis
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License 3.0 (AFL-3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/AFL-3.0
 *
 * @author    Creabilis <contact@creabilis.com>
 * @copyright Since 2002 Creabilis
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License 3.0 (AFL-3.0)
 * International Registered Trademark & Property of Creabilis
 */
namespace Creabilis\\CreaPrettyBlocks\\Block;

class ${className} extends AbstractBlock
{
    public function getDefinition(): array
    {
        return [
            'name' => $this->module->l('${escapePhp(input.nameLabel)}'),
            'description' => $this->module->l('${escapePhp(input.description)}'),
            'code' => '${escapePhp(input.code)}',
            'tab' => '${escapePhp(input.tab)}',
            'icon' => '${escapePhp(input.icon)}',
            'need_reload' => true,
            'templates' => [
                'default' => 'module:' . $this->module->name . '/views/templates/blocks/${escapePhp(
                  input.tplFilename
                )}',
            ],
${indent(definitionTail, 12)}
        ];
    }
}
`;
}

function buildConfigPhp(fieldsPhp: string): string {
  return `'config' => [
    'fields' => [
${indent(fieldsPhp, 8)}
    ],
],`;
}

function buildRepeaterPhp(args: {
  repeaterNameLabel: string;
  nameFrom: string;
  groupsPhp: string;
}): string {
  return `'repeater' => [
    'name' => $this->module->l('${escapePhp(args.repeaterNameLabel)}'),
    'nameFrom' => '${escapePhp(args.nameFrom)}',
    'groups' => [
${indent(args.groupsPhp, 8)}
    ],
],`;
}

function buildFieldsPhp(fields: BlockField[]): string {
  return fields.map((field) => buildFieldPhp(field)).join("\n");
}

function buildFieldPhp(field: BlockField): string {
  const parts: string[] = [];

  parts.push(`'type' => '${field.type}',`);
  parts.push(`'label' => $this->module->l('${escapePhp(field.label)}'),`);

  const commonParts = buildCommonFieldParts(field);
  if (commonParts.length > 0) {
    parts.push(...commonParts);
  }

  const extraParts = buildFieldExtraParts(field);
  if (extraParts.length > 0) {
    parts.push(...extraParts);
  }

  return `'${field.name}' => [
${indent(parts.join("\n"), 4)}
],`;
}

function buildCommonFieldParts(field: BlockField): string[] {
  const lines: string[] = [];

  if (field.forceDefaultValue === true) {
    lines.push(`'force_default_value' => true,`);
  }

  return lines;
}

function buildFieldExtraParts(field: BlockField): string[] {
  switch (field.type) {
    case "text":
    case "textarea":
    case "color": {
      if (typeof field.defaultValue === "string" && field.defaultValue.length > 0) {
        return [`'default' => '${escapePhp(field.defaultValue)}',`];
      }
      return [];
    }

    case "fileupload": {
      const path = field.path ?? "$/img/' . $this->module->name . '/";
      const defaultUrls = field.defaultUrls ?? [];

      const lines: string[] = [];
      lines.push(`'path' => '${escapePhp(path)}',`);

      if (defaultUrls.length > 0) {
        const defaultLines = defaultUrls
          .map((url) => `['url' => '${escapePhp(url)}'],`)
          .join("\n");

        lines.push(`'default' => [`);
        lines.push(indent(defaultLines, 4));
        lines.push(`],`);
      } else {
        lines.push(`'default' => [`);
        lines.push(indent(`['url' => ''],`, 4));
        lines.push(`],`);
      }

      return lines;
    }

    case "selector": {
      return [
        `'collection' => '${escapePhp(field.collection)}',`,
        `'selector' => '${escapePhp(field.selector)}',`,
      ];
    }

    case "editor": {
      const provider = field.provider ?? "vuequill";
      const lines: string[] = [`'provider' => '${escapePhp(provider)}',`];

      if (typeof field.defaultValue === "string" && field.defaultValue.length > 0) {
        lines.push(`'default' => '${escapePhp(field.defaultValue)}',`);
      }

      return lines;
    }

    case "checkbox": {
      const defaultBool = typeof field.defaultValue === "boolean" ? field.defaultValue : false;
      return [`'default' => ${defaultBool ? "true" : "false"},`];
    }

    case "radio_group":
    case "select": {
      const lines: string[] = [];

      if (typeof field.defaultValue === "string" && field.defaultValue.length > 0) {
        lines.push(`'default' => '${escapePhp(field.defaultValue)}',`);
      }

      const choicesLines = buildChoicesLines(field.choices);
      if (choicesLines.length > 0) {
        lines.push(`'choices' => [`);
        lines.push(indent(choicesLines.join("\n"), 4));
        lines.push(`],`);
      }

      return lines;
    }

    case "multiselect": {
      const lines: string[] = [];

      if (Array.isArray(field.defaultValue) && field.defaultValue.length > 0) {
        lines.push(`'default' => ${phpArray(field.defaultValue)},`);
      }

      const choicesLines = buildChoicesLines(field.choices);
      if (choicesLines.length > 0) {
        lines.push(`'choices' => [`);
        lines.push(indent(choicesLines.join("\n"), 4));
        lines.push(`],`);
      }

      return lines;
    }

    case "title": {
      if (!field.defaultValue) {
        return [];
      }

      return [
        `'default' => ${phpArrayAssoc({
          tag: field.defaultValue.tag,
          classes: field.defaultValue.classes,
          value: field.defaultValue.value,
          focus: field.defaultValue.focus,
          bold: field.defaultValue.bold,
          italic: field.defaultValue.italic,
          underline: field.defaultValue.underline,
          size: field.defaultValue.size,
        })},`,
      ];
    }

    case "slider": {
      const lines: string[] = [];

      if (typeof field.step === "number") {
        lines.push(`'step' => ${field.step},`);
      }

      if (typeof field.min === "number") {
        lines.push(`'min' => ${field.min},`);
      }

      if (typeof field.max === "number") {
        lines.push(`'max' => ${field.max},`);
      }

      if (typeof field.defaultValue === "number") {
        lines.push(`'default' => ${field.defaultValue},`);
      }

      return lines;
    }

    case "datepicker": {
      if (typeof field.defaultValue === "string" && field.defaultValue.length > 0) {
        return [`'default' => '${escapePhp(field.defaultValue)}',`];
      }
      return [];
    }

    default: {
      return assertNever(field);
    }
  }
}

function buildChoicesLines(choices: unknown): string[] {
  const normalized = normalizeChoices(choices);
  return normalized.map((c) => `'${escapePhp(c.id)}' => '${escapePhp(c.label)}',`);
}

function normalizeChoices(choices: unknown): Array<{ id: string; label: string }> {
  if (!Array.isArray(choices)) {
    return [];
  }

  return choices
    .map((item) => {
      if (typeof item === "string") {
        return { id: item, label: item };
      }

      if (typeof item === "object" && item && "id" in item && "label" in item) {
        const id = String((item as any).id);
        const label = String((item as any).label);
        return { id, label };
      }

      return null;
    })
    .filter(Boolean) as Array<{ id: string; label: string }>;
}

function phpArray(values: string[]): string {
  const items = values.map((v) => `'${escapePhp(v)}'`).join(", ");
  return `[${items}]`;
}

function phpArrayAssoc(obj: Record<string, unknown>): string {
  const lines = Object.entries(obj).map(([key, value]) => {
    if (Array.isArray(value)) {
      return `'${escapePhp(key)}' => ${phpArray(value.map(String))}`;
    }

    if (typeof value === "boolean") {
      return `'${escapePhp(key)}' => ${value ? "true" : "false"}`;
    }

    if (typeof value === "number") {
      return `'${escapePhp(key)}' => ${value}`;
    }

    return `'${escapePhp(key)}' => '${escapePhp(String(value ?? ""))}'`;
  });

  return `[
${indent(lines.join(",\n"), 4)}
]`;
}

function buildSimpleTplFile(input: BlockGeneratorInput): string {
  const baseClass = input.code.replace("cpb_", "cpb-");

  return `{**
 * Prettyblocks template - ${input.blockName}
 *}

<div class="${baseClass}">
  {if !$block.settings.default.container}
    <div class="container">
  {/if}

  <div class="${baseClass}__inner">
    {* Example field usage *}
    {if !empty($block.settings.title)}
      <p class="${baseClass}__title">
        {$block.settings.title}
      </p>
    {/if}
  </div>

  {if !$block.settings.default.container}
    </div>
  {/if}
</div>
`;
}

function buildRepeaterTplFile(input: BlockGeneratorInput): string {
  const baseClass = input.code.replace("cpb_", "cpb-");

  return `{**
 * Prettyblocks template - ${input.blockName} (Repeater)
 *}

{$blocks = $block.states}

{if !empty($blocks)}
  <div class="${baseClass}">
    {if !$block.settings.default.container}
      <div class="container">
    {/if}

    <div class="${baseClass}__items row g-3">
      {foreach from=$blocks item=block}
        <div class="col-12 col-md-6">
          <div class="${baseClass}__item card">
            <div class="card-body">
              {* Example repeater field usage *}
              {if !empty($block.title)}
                <p class="${baseClass}__title">
                  {$block.title nofilter}
                </p>
              {/if}
            </div>
          </div>
        </div>
      {/foreach}
    </div>

    {if !$block.settings.default.container}
      </div>
    {/if}
  </div>
{/if}
`;
}

function escapePhp(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function indent(value: string, spaces: number): string {
  const pad = " ".repeat(spaces);

  return value
    .split("\n")
    .map((line) => (line.trim().length > 0 ? `${pad}${line}` : line))
    .join("\n");
}

function assertNever(value: never): never {
  throw new Error(`Unhandled field type: ${JSON.stringify(value)}`);
}
