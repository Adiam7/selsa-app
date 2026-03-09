"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  BarChart3,
  Boxes,
  ChevronRight,
  ClipboardList,
  DollarSign,
  FileText,
  LayoutGrid,
  LifeBuoy,
  Package,
  Shield,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useBackofficeAccess } from "@/lib/hooks/useBackofficeAccess";

const NAV_ITEMS = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    description: "Sessions and ops overview",
    icon: LayoutGrid,
    key: "dashboard",
  },
  {
    href: "/admin/reports",
    label: "Reports",
    description: "Sales and operational KPIs",
    icon: BarChart3,
    key: "reports",
  },
  {
    href: "/admin/orders",
    label: "Orders",
    description: "Manage orders and shipping",
    icon: ClipboardList,
    key: "orders",
  },
  {
    href: "/admin/fulfillment",
    label: "Fulfillment",
    description: "Print and ship pipeline",
    icon: ClipboardList,
    key: "fulfillment",
  },
  {
    href: "/admin/finance",
    label: "Finance",
    description: "Payments and refunds",
    icon: DollarSign,
    key: "finance",
  },
  {
    href: "/admin/inventory",
    label: "Inventory",
    description: "Stock and adjustments",
    icon: Boxes,
    key: "inventory",
  },
  {
    href: "/admin/products",
    label: "Products",
    description: "Publish and unpublish",
    icon: Package,
    key: "products",
  },
  {
    href: "/admin/customers",
    label: "Customers",
    description: "Customer records",
    icon: Users,
    key: "customers",
  },
  {
    href: "/admin/staff",
    label: "Staff",
    description: "Access and roles",
    icon: Users,
    key: "staff",
  },
  {
    href: "/admin/audit-logs",
    label: "Audit Logs",
    description: "Activity trail",
    icon: FileText,
    key: "audit_logs",
  },
  {
    href: "/admin/risk-monitoring",
    label: "Risk Monitoring",
    description: "Fraud and risk",
    icon: Shield,
    key: "risk",
  },
  {
    href: "/admin/support",
    label: "Support",
    description: "Tickets and macros",
    icon: LifeBuoy,
    key: "support",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { data: session } = useSession();
  const { modules, checked, canAccessAdmin } = useBackofficeAccess();

  const userName = (session?.user as any)?.name || (session?.user as any)?.email || t("Admin");
  const userEmail = (session?.user as any)?.email || "";

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "A"
    );
  };

  const items = NAV_ITEMS.filter((item) => {
    if (!checked) return true;
    if (!canAccessAdmin) return false;

    // Dashboard is always visible if the user can access any backoffice module.
    if (item.key === "dashboard") return true;

    // Reports use the dashboard endpoints; gate it behind orders/finance visibility.
    if (item.key === "reports") return Boolean(modules.orders || modules.finance);

    if (item.key === "orders" || item.key === "fulfillment") return Boolean(modules.orders);
    if (item.key === "finance") return Boolean(modules.finance);
    if (item.key === "inventory") return Boolean(modules.inventory);
    if (item.key === "products") return Boolean(modules.products);
    if (item.key === "customers") return Boolean(modules.customers);
    if (item.key === "staff") return Boolean(modules.staff);
    if (item.key === "support") return Boolean(modules.support);
    if (item.key === "audit_logs") return Boolean(modules.audit_logs);
    if (item.key === "risk") return Boolean(modules.risk);

    return true;
  });

  return (
    <aside className="w-72 shrink-0 border-r border-border bg-background min-h-full flex flex-col">
      <div className="p-4">
        <div className="rounded-2xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-foreground text-background flex items-center justify-center text-sm font-semibold">
              {getInitials(String(userName))}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">{String(userName)}</div>
              {userEmail ? (
                <div className="truncate text-xs text-muted-foreground">{userEmail}</div>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold text-foreground">
              {t("Admin")}
            </span>
            <span className="inline-flex items-center rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold text-background">
              {t("Control Center")}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-6">
        <div>
          <h4 className="px-2 pb-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground border-b border-border">
            {t("Admin")}
          </h4>
          <div className="mt-3 flex flex-col gap-1">
            {items.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition outline-none focus-visible:ring-2 focus-visible:ring-ring/50 no-underline ${
                    isActive
                      ? "bg-black! text-white! hover:bg-black! hover:text-white! visited:text-white!"
                      : "text-foreground! hover:text-foreground! visited:text-foreground! hover:bg-muted/40"
                  }`}
                  title={t(item.description)}
                >
                  <Icon
                    className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                      isActive
                        ? "text-white!"
                        : "text-muted-foreground! group-hover:text-foreground!"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`truncate text-[13px] font-medium ${
                        isActive ? "text-white!" : "text-foreground!"
                      }`}
                    >
                      {t(item.label)}
                    </div>
                    <div
                      className={`truncate text-[11px] ${
                        isActive ? "text-white/70!" : "text-muted-foreground!"
                      }`}
                    >
                      {t(item.description)}
                    </div>
                  </div>
                  {isActive ? (
                    <ChevronRight className="h-4 w-4 text-white/60" aria-hidden="true" />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}
