"use client";

import { useMemo, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MenuItem, FlattenedItem, ReorderItem } from "@/types/menu";

const INDENT_PX = 24;

function flattenTree(
  items: MenuItem[],
  expandedIds: Set<number>,
  parentId: number | null = null,
  depth = 0,
): FlattenedItem[] {
  const result: FlattenedItem[] = [];
  for (const item of items) {
    result.push({ ...item, depth, parentId });
    if (item.children?.length && expandedIds.has(item.id)) {
      result.push(
        ...flattenTree(item.children, expandedIds, item.id, depth + 1),
      );
    }
  }
  return result;
}

function getSubtreeMaxDepth(item: MenuItem | FlattenedItem): number {
  if (!item.children?.length) return 0;
  return 1 + Math.max(...item.children.map(getSubtreeMaxDepth));
}

function getProjection(
  flatItems: FlattenedItem[],
  activeId: number,
  overId: number,
  dragOffsetX: number,
): { depth: number; parentId: number | null } {
  const overIndex = flatItems.findIndex((i) => i.id === overId);
  const activeIndex = flatItems.findIndex((i) => i.id === activeId);
  const activeItem = flatItems[activeIndex];

  const newItems = arrayMove(flatItems, activeIndex, overIndex);
  const projectedIndex = newItems.findIndex((i) => i.id === activeId);

  const depthOffset = Math.round(dragOffsetX / INDENT_PX);
  const subtreeDepth = getSubtreeMaxDepth(activeItem);

  const prevItem = newItems[projectedIndex - 1];
  const nextItem = newItems[projectedIndex + 1];

  const maxDepth = prevItem
    ? Math.min(prevItem.depth + 1, 3 - 1 - subtreeDepth)
    : 0;
  const minDepth = nextItem ? nextItem.depth : 0;

  let projectedDepth = activeItem.depth + depthOffset;
  projectedDepth = Math.max(minDepth, Math.min(maxDepth, projectedDepth));
  projectedDepth = Math.max(0, projectedDepth);

  let parentId: number | null = null;
  if (projectedDepth > 0) {
    for (let i = projectedIndex - 1; i >= 0; i--) {
      if (newItems[i].depth === projectedDepth - 1) {
        parentId = newItems[i].id;
        break;
      }
    }
  }

  return { depth: projectedDepth, parentId };
}

function buildReorderPayload(flatItems: FlattenedItem[]): ReorderItem[] {
  const positionCounters = new Map<number | null, number>();
  return flatItems.map((item) => {
    const key = item.parentId;
    const pos = positionCounters.get(key) ?? 0;
    positionCounters.set(key, pos + 1);
    return { id: item.id, position: pos, parentId: item.parentId };
  });
}

const typeBadgeColors: Record<string, string> = {
  CATEGORY: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  FILTER:
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  LINK: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

function SortableMenuItem({
  item,
  hasChildren,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  isOverlay,
}: {
  item: FlattenedItem;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggle: (id: number) => void;
  onEdit: (item: FlattenedItem) => void;
  onDelete: (id: number) => void;
  isOverlay?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    paddingLeft: `${item.depth * INDENT_PX}px`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-background px-2 py-1.5",
        isDragging && "opacity-50",
        isOverlay && "shadow-lg",
      )}
      {...attributes}
    >
      <button
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...listeners}
      >
        <GripVertical size={16} />
      </button>

      {hasChildren ? (
        <button
          onClick={() => onToggle(item.id)}
          className="text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      ) : (
        <span className="w-4" />
      )}

      <span className="flex-1 truncate text-sm font-medium">{item.label}</span>

      <span
        className={cn(
          "rounded px-1.5 py-0.5 text-xs font-medium",
          typeBadgeColors[item.type],
        )}
      >
        {item.type}
      </span>

      {item.category && (
        <span className="text-xs text-muted-foreground">
          {item.category.name}
        </span>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => onEdit(item)}
      >
        <Pencil size={14} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-destructive hover:text-destructive"
        onClick={() => onDelete(item.id)}
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
}

interface MenuTreeProps {
  tree: MenuItem[];
  onEdit: (item: FlattenedItem) => void;
  onDelete: (id: number) => void;
  onReorder: (items: ReorderItem[]) => void;
}

export function MenuTree({ tree, onEdit, onDelete, onReorder }: MenuTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(
    () => new Set(tree.map((i) => i.id)),
  );
  const [activeId, setActiveId] = useState<number | null>(null);
  const offsetRef = useRef(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const flatItems = useMemo(
    () => flattenTree(tree, expandedIds),
    [tree, expandedIds],
  );

  const activeItem = activeId
    ? flatItems.find((i) => i.id === activeId)
    : null;

  const childrenMap = useMemo(() => {
    const map = new Map<number, boolean>();
    for (const item of flatItems) {
      if (!map.has(item.id)) {
        const original = findItemById(tree, item.id);
        map.set(item.id, !!original?.children?.length);
      }
    }
    return map;
  }, [flatItems, tree]);

  function toggleExpanded(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(Number(event.active.id));
    offsetRef.current = 0;
  }

  function handleDragMove(event: { delta: { x: number } }) {
    offsetRef.current = event.delta.x;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeIdx = flatItems.findIndex((i) => i.id === active.id);
    const overIdx = flatItems.findIndex((i) => i.id === over.id);
    if (activeIdx === -1 || overIdx === -1) return;

    const projection = getProjection(
      flatItems,
      Number(active.id),
      Number(over.id),
      offsetRef.current,
    );

    const moved = arrayMove(flatItems, activeIdx, overIdx);
    const movedItem = moved.find((i) => i.id === active.id)!;
    movedItem.depth = projection.depth;
    movedItem.parentId = projection.parentId;

    const payload = buildReorderPayload(moved);
    onReorder(payload);
  }

  if (flatItems.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No menu items yet. Click &quot;Add Menu Item&quot; to get started.
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
    >
      <SortableContext
        items={flatItems.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-1">
          {flatItems.map((item) => (
            <SortableMenuItem
              key={item.id}
              item={item}
              hasChildren={childrenMap.get(item.id) ?? false}
              isExpanded={expandedIds.has(item.id)}
              onToggle={toggleExpanded}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeItem ? (
          <SortableMenuItem
            item={{ ...activeItem, depth: 0 }}
            hasChildren={false}
            isExpanded={false}
            onToggle={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function findItemById(items: MenuItem[], id: number): MenuItem | undefined {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return undefined;
}
