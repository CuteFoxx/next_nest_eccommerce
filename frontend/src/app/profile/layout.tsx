import { ProfileNav } from "@/components/nav/profileNav";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-8 py-8">
      <ProfileNav />
      <div className="flex-1">{children}</div>
    </div>
  );
}
