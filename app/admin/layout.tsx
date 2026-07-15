import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { ToastProvider } from "@/contexts/ToastContext";

export const metadata: Metadata = {
  title: { default: "Back-office", template: "%s | Admin Abu Maryam TV" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-[#f0ece3]">
        <AdminSidebar />
        <div className="flex-1 min-w-0 overflow-auto">
          {children}
        </div>
      </div>
    </ToastProvider>
  );
}
