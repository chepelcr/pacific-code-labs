import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Logo } from "@/components/shared/Logo";
import { Menu } from "lucide-react";
import { AdminLangProvider } from "@/lib/admin-lang";

interface Props {
  children: React.ReactNode;
}

export function AdminLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AdminLangProvider>
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden" data-testid="admin-layout">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-64 h-full">
            <AdminSidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 h-14 px-4 bg-white border-b border-[#E2E8F0]">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-[#64748B] hover:text-[#0F172A]"
            data-testid="mobile-menu-btn"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="text-[#0F172A] font-semibold text-sm">Admin</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
    </AdminLangProvider>
  );
}
