"use client";

import type {
  Control,
  FieldValues,
  UseFormRegister,
} from "react-hook-form";
import { Controller, useFieldArray } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FieldType = "text" | "select" | "fileupload" | "editor" | "color";

type FieldArrayEditorProps<TForm extends FieldValues> = {
  title: string;
  control: Control<TForm>;
  register: UseFormRegister<TForm>;
  name: string;
};

export function FieldArrayEditor<TForm extends FieldValues>({
  title,
  control,
  register,
  name,
}: FieldArrayEditorProps<TForm>) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as never,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{title}</h3>

        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            append({
              name: "",
              label: "",
              type: "text",
            } as never)
          }
        >
          Add field
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => {
          const base = `${name}.${index}`;

          return (
            <div key={field.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Field #{index + 1}</p>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor={`${base}.name`}>Name (snake_case)</Label>
                  <Input
                    id={`${base}.name`}
                    {...register(`${base}.name` as never)}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`${base}.label`}>Label</Label>
                  <Input
                    id={`${base}.label`}
                    {...register(`${base}.label` as never)}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Type</Label>

                  {/* shadcn Select needs Controller */}
                  <Controller
                    control={control}
                    name={`${base}.type` as never}
                    render={({ field: rhfField }) => (
                      <Select
                        value={(rhfField.value ?? "text") as FieldType}
                        onValueChange={(value) => rhfField.onChange(value as FieldType)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="select">Select</SelectItem>
                          <SelectItem value="fileupload">File upload</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="color">Color</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
