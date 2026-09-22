import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/rbac";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingBag,
  Users,
  Ticket,
  Star,
  FileText,
  ExternalLink,
  Shield,
} from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let adminUser: any;
  try {
    adminUser = await requireAdmin();
  } catch {
    redirect("/login?redirect=/admin");
  }

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: Layers },
    { label: "Inventory", href: "/admin/inventory", icon: Boxes },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Coupons", href: "/admin/coupons", icon: Ticket },
    { label: "Reviews", href: "/admin/reviews", icon: Star },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between">
        <div>
          {/* Brand header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                AZ
              </div>
              <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white">
                Admin Console
              </span>
            </Link>
            <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded">
              {adminUser.role}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Icon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Storefront Link & Admin Profile */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <span>View Public Store</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <div className="px-3 py-2 flex items-center justify-between text-xs">
            <div className="truncate">
              <p className="font-bold text-zinc-900 dark:text-white truncate">
                {adminUser.firstName} {adminUser.lastName}
              </p>
              <p className="text-[10px] text-zinc-400 truncate">{adminUser.email}</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
