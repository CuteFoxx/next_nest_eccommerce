"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import axios from "axios";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";

type Category = { id: number; name: string };

const categoryFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z
    .string()
    .refine((v) => v === "" || v.length >= 10, {
      message: "Description must be at least 10 characters",
    })
    .optional(),
  position: z.string().optional(),
  parentId: z.string().optional(),
  file: z
    .instanceof(typeof window !== "undefined" ? File : Object)
    .optional()
    .refine(
      (f) => !f || (f instanceof File && f.size <= 15 * 1024 * 1024),
      "File must be under 15 MB",
    )
    .refine(
      (f) => !f || (f instanceof File && /image\/(jpeg|png|webp)/.test(f.type)),
      "Only JPEG, PNG, or WebP images are allowed",
    ),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  onSuccess?: () => void;
}

export function CategoryForm({ onSuccess }: CategoryFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get<Category[]>("/category").then((res) => setCategories(res.data));
  }, []);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      position: "",
      parentId: "",
    },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.description) formData.append("description", data.description);
      if (data.position) formData.append("position", data.position);
      if (data.parentId) formData.append("parentId", data.parentId);
      if (data.file instanceof File) formData.append("file", data.file);

      await api.post("/category", formData);
      form.reset();
      onSuccess?.();
    } catch (error) {
      form.setError("root", {
        message:
          axios.isAxiosError(error) && error.response?.data?.message
            ? Array.isArray(error.response.data.message)
              ? error.response.data.message.join(", ")
              : error.response.data.message
            : "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Name</FieldLabel>
              <Input {...field} placeholder="Category name" />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Description</FieldLabel>
              <Input {...field} placeholder="Description (optional)" />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="position"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Position</FieldLabel>
              <Input
                {...field}
                type="number"
                min={0}
                placeholder="Position (optional)"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="parentId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Parent category</FieldLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={categories.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="None (top-level)" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="file"
          control={form.control}
          render={({
            field: { onChange, value: _value, ...field },
            fieldState,
          }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Image</FieldLabel>
              <Input
                {...field}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => onChange(e.target.files?.[0])}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {form.formState.errors.root && (
          <FieldError errors={[form.formState.errors.root]} />
        )}
      </FieldGroup>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Creating..." : "Create Category"}
      </Button>
    </form>
  );
}
