export type MenuItemType = "CATEGORY" | "FILTER" | "LINK";

export type MenuItem = {
  id: number;
  label: string;
  type: MenuItemType;
  position: number;
  parentId?: number;
  categoryId?: number;
  url?: string;
  category?: { id: number; name: string; slug: string };
  image?: { id: number; url: string; alt?: string };
  filterValues?: Array<{
    attributeValue: {
      id: number;
      name: string;
      slug: string;
      attribute: { id: number; name: string; slug: string };
    };
  }>;
  children?: MenuItem[];
};

export type ReorderItem = {
  id: number;
  position: number;
  parentId: number | null;
};

export type FlattenedItem = Omit<MenuItem, "parentId"> & {
  depth: number;
  parentId: number | null;
};
