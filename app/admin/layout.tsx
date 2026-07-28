"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { ToastProvider } from "@/contexts/ToastContext";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <html lang="fr" className={fontVariables}>
      <body className="min-h-screen bg-[#f0ece3] text-[#232a20]">
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
      </body>
    </html>
  );
}
