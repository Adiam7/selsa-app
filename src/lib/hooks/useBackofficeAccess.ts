"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api/client";

export type BackofficeModule =
  | "orders"
  | "customers"
  | "staff"
  | "support"
  | "finance"
  | "inventory"
  | "products"
  | "risk"
  | "audit_logs";

export type BackofficeAccess = {
  canAccessAdmin: boolean;
  modules: Record<BackofficeModule, boolean>;
  checked: boolean;
};

const DEFAULT_ACCESS: BackofficeAccess = {
  canAccessAdmin: false,
  checked: false,
  modules: {
    orders: false,
    customers: false,
    staff: false,
    support: false,
    finance: false,
    inventory: false,
    products: false,
    risk: false,
    audit_logs: false,
  },
};

const STORAGE_KEY = "backoffice_access_v1";
const STORAGE_TTL_MS = 5 * 60 * 1000;

function loadCached(): BackofficeAccess | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.ts || typeof parsed.ts !== "number") return null;
    if (Date.now() - parsed.ts > STORAGE_TTL_MS) return null;
    return parsed.value as BackofficeAccess;
  } catch {
    return null;
  }
}

function saveCached(value: BackofficeAccess) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now(), value }));
  } catch {
    // ignore
  }
}

async function checkEndpoint(fn: () => Promise<any>): Promise<boolean> {
  try {
    await fn();
    return true;
  } catch {
    return false;
  }
}

async function checkAnyEndpoint(fns: Array<() => Promise<any>>): Promise<boolean> {
  const results = await Promise.all(fns.map((fn) => checkEndpoint(fn)));
  return results.some(Boolean);
}

export function useBackofficeAccess(options?: { skip?: boolean }) {
  const [state, setState] = useState<BackofficeAccess>(DEFAULT_ACCESS);

  useEffect(() => {
    if (options?.skip) return;

    const cached = loadCached();
    if (cached) {
      setState({ ...cached, checked: true });
      return;
    }

    let cancelled = false;

    const run = async () => {
      const modules: BackofficeAccess["modules"] = { ...DEFAULT_ACCESS.modules };

      // Keep these checks lightweight.
      const [
        orders,
        support,
        finance,
        inventory,
        products,
        customers,
        staff,
        auditLogs,
      ] = await Promise.all([
        checkEndpoint(() => apiClient.get("/orders/admin-orders/", { params: { limit: 1 } })),
        checkEndpoint(() => apiClient.get("/support/tickets/", { params: { page_size: 1 } })),
        checkEndpoint(() => apiClient.get("/payments/admin-finance/overview/")),
        checkEndpoint(() => apiClient.get("/inventory/reconciliations/", { params: { page_size: 1 } })),
        checkEndpoint(() => apiClient.get("/catalog/admin-products/", { params: { page_size: 1 } })),
        checkEndpoint(() => apiClient.get("/accounts/admin-customers/", { params: { page_size: 1 } })),
        checkEndpoint(() => apiClient.get("/accounts/admin-staff/", { params: { page_size: 1 } })),
        checkAnyEndpoint([
          () => apiClient.get("/orders/admin-audit-logs/", { params: { page_size: 1 } }),
          () => apiClient.get("/inventory/audit-events/", { params: { page_size: 1 } }),
        ]),
      ]);

      modules.orders = orders;
      modules.support = support;
      modules.finance = finance;
      modules.inventory = inventory;
      modules.products = products;
      modules.customers = customers;
      modules.staff = staff;
      modules.audit_logs = auditLogs;

      // Risk monitoring is frontend-only right now; gate it with admin access.
      modules.risk = orders || support || finance || inventory || products || customers || staff || auditLogs;

      const next: BackofficeAccess = {
        checked: true,
        canAccessAdmin: Object.values(modules).some(Boolean),
        modules,
      };

      if (cancelled) return;
      setState(next);
      saveCached(next);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [options?.skip]);

  const visibleModules = useMemo(() => state.modules, [state.modules]);

  return {
    ...state,
    visibleModules,
  };
}
