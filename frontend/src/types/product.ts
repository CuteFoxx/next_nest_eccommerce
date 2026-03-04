export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type FilePurpose = "GENERAL" | "PRODUCT_IMAGE" | "CATEGORY_IMAGE";

export type ProductFile = {
  id: number;
  url: string;
  alt: string | null;
};

export type ProductImage = {
  position: number;
  file: ProductFile;
};

export type AttributeValue = {
  name: string;
  slug: string;
};

export type GroupedAttributes = Record<
  string,
  { name: string; values: AttributeValue[] }
>;

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  status: ProductStatus;
  categoryId: number | null;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  attributes: GroupedAttributes;
};
