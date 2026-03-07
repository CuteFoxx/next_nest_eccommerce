import { AdminNav } from "@/components/nav/adminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-8 py-8">
      <AdminNav />
      <div className="flex-1">{children}</div>
    </div>
  );
}
