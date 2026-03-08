"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MenuTree } from "@/components/menu/menuTree";
import { MenuItemForm } from "@/components/menu/menuItemForm";
import { api } from "@/lib/api";
import type { FlattenedItem, MenuItem, ReorderItem } from "@/types/menu";

export default function AdminMenuPage() {
  const [tree, setTree] = useState<MenuItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<FlattenedItem | undefined>();

  const refreshTree = useCallback(() => {
    api.get<MenuItem[]>("/menu/tree").then((res) => setTree(res.data));
  }, []);

  useEffect(() => {
    refreshTree();
  }, [refreshTree]);

  function handleEdit(item: FlattenedItem) {
    setEditItem(item);
    setIsFormOpen(true);
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this menu item and all its children?")) return;
    await api.delete(`/menu/${id}`);
    refreshTree();
  }

  async function handleReorder(items: ReorderItem[]) {
    const res = await api.put<MenuItem[]>("/menu/reorder", { items });
    setTree(res.data);
  }

  function handleFormSuccess() {
    setIsFormOpen(false);
    setEditItem(undefined);
    refreshTree();
  }

  function openCreateForm() {
    setEditItem(undefined);
    setIsFormOpen(true);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Menu</h1>
        <Button onClick={openCreateForm} size="sm">
          <Plus size={16} className="mr-1" />
          Add Menu Item
        </Button>
      </div>

      <MenuTree
        tree={tree}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReorder={handleReorder}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Edit Menu Item" : "New Menu Item"}
            </DialogTitle>
          </DialogHeader>
          <MenuItemForm
            key={editItem?.id ?? "new"}
            editItem={editItem}
            menuItems={tree}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
