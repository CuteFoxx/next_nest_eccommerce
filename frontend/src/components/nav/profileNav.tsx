"use client";

import Link from "next/link";
import { LayoutDashboard, User } from "lucide-react";
import { useAuth } from "@/context/auth.context";

export function ProfileNav() {
  const { user } = useAuth();

  return (
    <nav className="flex w-48 shrink-0 flex-col gap-1">
      <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm">
        <User size={16} />
        Profile
      </Link>
      {user?.role === "ADMIN" && (
        <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm">
          <LayoutDashboard size={16} />
          Admin Dashboard
        </Link>
      )}
    </nav>
  );
}
