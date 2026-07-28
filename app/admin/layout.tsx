"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { ToastProvider } from "@/contexts/ToastContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <ToastProvider>
      {isLoginPage ? (
        children
      ) : (
        <div className="flex min-h-screen bg-[#f0ece3]">
          <AdminSidebar />
          <div id="main-content" className="flex-1 min-w-0 overflow-auto">
            {children}
          </div>
        </div>
      )}
    </ToastProvider>
  );
}
