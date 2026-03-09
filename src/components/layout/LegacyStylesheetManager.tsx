"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

const PUBLIC_LEGACY_STYLESHEETS = [
  "/stylesheets/website.css",
  "/stylesheets/HeaderTile.css",
  "/stylesheets/CoverTile.css",
  "/stylesheets/TextTile.css",
  "/stylesheets/CTATile.css",
  "/stylesheets/LocationTile.css",
  "/stylesheets/FooterTile.css",
  "/stylesheets/QuestrialFont.css",
  "/stylesheets/pagination.css",
  "/stylesheets/swiper.css",
  "/stylesheets/product.css",
  "/stylesheets/product_detail_user.css",
  "/stylesheets/sidebar.css",
] as const;

const ADMIN_DASHBOARD_LEGACY_STYLESHEETS = [
  "/stylesheets/website.css",
  "/stylesheets/HeaderTile.css",
  "/stylesheets/FooterTile.css",
  "/stylesheets/QuestrialFont.css",
] as const;

const LEGACY_ATTR = "data-legacy-css";

function syncLegacyStylesheets(desiredHrefs: readonly string[]) {
  if (typeof document === "undefined") return;

  const desiredSet = new Set(desiredHrefs);
  const existingLinks = Array.from(document.querySelectorAll<HTMLLinkElement>(`link[${LEGACY_ATTR}]`));

  for (const link of existingLinks) {
    const href = link.getAttribute(LEGACY_ATTR) || link.getAttribute("href") || "";
    if (!desiredSet.has(href)) {
      link.parentNode?.removeChild(link);
    }
  }

  for (const href of desiredHrefs) {
    const alreadyPresent = document.querySelector(`link[${LEGACY_ATTR}="${href}"]`);
    if (alreadyPresent) continue;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute(LEGACY_ATTR, href);
    document.head.appendChild(link);
  }
}

export function LegacyStylesheetManager() {
  const pathname = usePathname() || "";

  useLayoutEffect(() => {
    const isAdmin = pathname.startsWith("/admin");
    const isAdminDashboard = pathname === "/admin/dashboard" || pathname.startsWith("/admin/dashboard/");

    const desired = isAdmin
      ? isAdminDashboard
        ? ADMIN_DASHBOARD_LEGACY_STYLESHEETS
        : ([] as const)
      : PUBLIC_LEGACY_STYLESHEETS;

    syncLegacyStylesheets(desired);
  }, [pathname]);

  return null;
}
