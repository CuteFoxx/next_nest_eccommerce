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
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import type { FlattenedItem, MenuItem } from "@/types/menu";

type Category = { id: number; name: string };
type FilterAttribute = {
  id: number;
  name: string;
  slug: string;
  values: { id: number; name: string; slug: string; productCount: number }[];
};

const menuItemFormSchema = z
  .object({
    label: z.string().min(1, "Label is required"),
    type: z.enum(["CATEGORY", "FILTER", "LINK"]),
    parentId: z.string().optional(),
    categoryId: z.string().optional(),
    attributeValueIds: z.array(z.number()).optional(),
    url: z.string().optional(),
    file: z
      .instanceof(typeof window !== "undefined" ? File : Object)
      .optional()
      .refine(
        (f) => !f || (f instanceof File && f.size <= 15 * 1024 * 1024),
        "File must be under 15 MB",
      )
      .refine(
        (f) =>
          !f || (f instanceof File && /image\/(jpeg|png|webp)/.test(f.type)),
        "Only JPEG, PNG, or WebP images are allowed",
      ),
  })
  .refine(
    (d) => d.type !== "CATEGORY" || (d.categoryId && d.categoryId !== ""),
    { message: "Category is required", path: ["categoryId"] },
  )
  .refine(
    (d) => d.type !== "FILTER" || (d.categoryId && d.categoryId !== ""),
    { message: "Category is required for filters", path: ["categoryId"] },
  )
  .refine(
    (d) =>
      d.type !== "FILTER" ||
      (d.attributeValueIds && d.attributeValueIds.length > 0),
    {
      message: "Select at least one attribute value",
      path: ["attributeValueIds"],
    },
  )
  .refine((d) => d.type !== "LINK" || (d.url && d.url.length > 0), {
    message: "URL is required for link items",
    path: ["url"],
  });

type MenuItemFormValues = z.infer<typeof menuItemFormSchema>;

interface MenuItemFormProps {
  editItem?: MenuItem | FlattenedItem;
  menuItems: MenuItem[];
  onSuccess: () => void;
}

function flattenForParentSelect(
  items: MenuItem[],
  depth = 0,
): Array<MenuItem & { depth: number }> {
  const result: Array<MenuItem & { depth: number }> = [];
  for (const item of items) {
    if (depth < 2) {
      result.push({ ...item, depth });
      if (item.children) {
        result.push(...flattenForParentSelect(item.children, depth + 1));
      }
    }
  }
  return result;
}

export function MenuItemForm({
  editItem,
  menuItems,
  onSuccess,
}: MenuItemFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterAttribute[]>([]);
  const parentOptions = flattenForParentSelect(menuItems).filter(
    (item) => item.id !== editItem?.id,
  );

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      label: editItem?.label ?? "",
      type: editItem?.type ?? "CATEGORY",
      parentId: editItem?.parentId ? String(editItem.parentId) : "",
      categoryId: editItem?.categoryId ? String(editItem.categoryId) : "",
      attributeValueIds:
        editItem?.filterValues?.map((fv) => fv.attributeValue.id) ?? [],
      url: editItem?.url ?? "",
    },
  });

  const watchedType = form.watch("type");
  const watchedCategoryId = form.watch("categoryId");

  useEffect(() => {
    api.get<Category[]>("/category").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    if (
      (watchedType === "FILTER" || watchedType === "CATEGORY") &&
      watchedCategoryId
    ) {
      api
        .get<FilterAttribute[]>(
          `/attributes/categories/${watchedCategoryId}/filters`,
        )
        .then((res) => setFilters(res.data));
    } else {
      setFilters([]);
    }
  }, [watchedType, watchedCategoryId]);

  const onSubmit = async (data: MenuItemFormValues) => {
    try {
      if (editItem) {
        await api.patch(`/menu/${editItem.id}`, {
          label: data.label,
          type: data.type,
          parentId: data.parentId ? Number(data.parentId) : undefined,
          categoryId: data.categoryId ? Number(data.categoryId) : undefined,
          attributeValueIds:
            data.type === "FILTER" ? data.attributeValueIds : undefined,
          url: data.type === "LINK" ? data.url : undefined,
        });
      } else {
        const formData = new FormData();
        formData.append("label", data.label);
        formData.append("type", data.type);
        if (data.parentId) formData.append("parentId", data.parentId);
        if (data.categoryId) formData.append("categoryId", data.categoryId);
        if (data.type === "FILTER" && data.attributeValueIds) {
          data.attributeValueIds.forEach((id) =>
            formData.append("attributeValueIds[]", String(id)),
          );
        }
        if (data.type === "LINK" && data.url) formData.append("url", data.url);
        if (data.file instanceof File) formData.append("file", data.file);

        await api.post("/menu", formData);
      }
      form.reset();
      onSuccess();
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
          name="label"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Label</FieldLabel>
              <Input {...field} placeholder="Menu item label" />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="type"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Type</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CATEGORY">Category</SelectItem>
                  <SelectItem value="FILTER">Filter</SelectItem>
                  <SelectItem value="LINK">Link</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="parentId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Parent item</FieldLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={parentOptions.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="None (top-level)" />
                </SelectTrigger>
                <SelectContent>
                  {parentOptions.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {"—".repeat(item.depth)} {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {(watchedType === "CATEGORY" || watchedType === "FILTER") && (
          <Controller
            name="categoryId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Category</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={categories.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
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
        )}

        {watchedType === "FILTER" && filters.length > 0 && (
          <Controller
            name="attributeValueIds"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Attribute Values</FieldLabel>
                <div className="flex flex-col gap-3">
                  {filters.map((attr) => (
                    <div key={attr.id}>
                      <p className="mb-1 text-sm font-medium text-muted-foreground">
                        {attr.name}
                      </p>
                      <div className="flex flex-col gap-1.5 pl-2">
                        {attr.values.map((val) => {
                          const checked =
                            field.value?.includes(val.id) ?? false;
                          return (
                            <label
                              key={val.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(c) => {
                                  const current = field.value ?? [];
                                  field.onChange(
                                    c
                                      ? [...current, val.id]
                                      : current.filter(
                                          (id: number) => id !== val.id,
                                        ),
                                  );
                                }}
                              />
                              {val.name}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        )}

        {watchedType === "LINK" && (
          <Controller
            name="url"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>URL</FieldLabel>
                <Input {...field} placeholder="https://example.com" />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        )}

        {!editItem && (
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
        )}

        {form.formState.errors.root && (
          <FieldError errors={[form.formState.errors.root]} />
        )}
      </FieldGroup>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting
          ? editItem
            ? "Saving..."
            : "Creating..."
          : editItem
            ? "Save Changes"
            : "Create Menu Item"}
      </Button>
    </form>
  );
}
