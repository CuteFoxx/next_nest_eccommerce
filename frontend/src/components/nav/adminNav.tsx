import Link from "next/link";
import { LayoutDashboard, Tag, Package } from "lucide-react";

export function AdminNav() {
  return (
    <nav className="flex w-48 shrink-0 flex-col gap-1">
      <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm">
        <LayoutDashboard size={16} />
        Dashboard
      </Link>
      <Link href="/admin/categories" className="flex items-center gap-2 px-3 py-2 text-sm">
        <Tag size={16} />
        Categories
      </Link>
      <Link href="/admin/products" className="flex items-center gap-2 px-3 py-2 text-sm">
        <Package size={16} />
        Products
      </Link>
    </nav>
  );
}
