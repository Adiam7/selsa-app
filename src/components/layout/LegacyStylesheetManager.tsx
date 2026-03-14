"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Legacy stylesheets loaded as normal `<link>` tags on public pages.
 */
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

/**
 * On the admin dashboard we show the site header/footer, so legacy CSS is
 * needed.  Header/footer CSS files are loaded as normal <link> tags (unlayered)
 * so they keep full cascade power — identical to public pages like /account/profile.
 * Only website.css (which contains the destructive `*` universal reset) is
 * wrapped in `@layer legacy` to avoid overriding Tailwind utilities in the
 * admin content area.
 */
const ADMIN_DASHBOARD_UNLAYERED = [
  "/stylesheets/HeaderTile.css",
  "/stylesheets/FooterTile.css",
  "/stylesheets/QuestrialFont.css",
] as const;

const ADMIN_DASHBOARD_LAYERED = [
  "/stylesheets/website.css",
] as const;

const LEGACY_ATTR = "data-legacy-css";
const LEGACY_LAYER_STYLE_ID = "__legacy-css-layered";

/** Cache fetched CSS text so we don't re-fetch on every route change. */
const cssCache = new Map<string, string>();

async function fetchCssText(href: string): Promise<string> {
  const cached = cssCache.get(href);
  if (cached !== undefined) return cached;
  try {
    const res = await fetch(href);
    const text = await res.text();
    cssCache.set(href, text);
    return text;
  } catch {
    cssCache.set(href, "");
    return "";
  }
}

/**
 * Remove all legacy `<link>` tags.
 */
function removeLegacyLinks() {
  const links = document.querySelectorAll<HTMLLinkElement>(`link[${LEGACY_ATTR}]`);
  links.forEach((link) => link.remove());
}

/**
 * Sync legacy CSS as normal `<link>` tags (for public pages).
 */
function syncLegacyLinks(desiredHrefs: readonly string[]) {
  if (typeof document === "undefined") return;

  const desiredSet = new Set(desiredHrefs);

  // Remove links that are no longer desired.
  const existing = Array.from(
    document.querySelectorAll<HTMLLinkElement>(`link[${LEGACY_ATTR}]`)
  );
  for (const link of existing) {
    const href = link.getAttribute(LEGACY_ATTR) || "";
    if (!desiredSet.has(href)) link.remove();
  }

  // Add missing links.
  for (const href of desiredHrefs) {
    if (document.querySelector(`link[${LEGACY_ATTR}="${href}"]`)) continue;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute(LEGACY_ATTR, href);
    document.head.appendChild(link);
  }
}

/**
 * Fetch legacy CSS files, concatenate their content inside `@layer legacy { }`,
 * and inject as a single `<style>` tag.  This guarantees the CSS is placed
 * inside the legacy cascade layer regardless of browser quirks with
 * `@import url(...) layer()`.
 */
async function injectLegacyLayered(hrefs: readonly string[]) {
  if (typeof document === "undefined") return;

  const texts = await Promise.all(hrefs.map(fetchCssText));
  const combined = texts.filter(Boolean).join("\n");

  let styleEl = document.getElementById(LEGACY_LAYER_STYLE_ID) as HTMLStyleElement | null;

  if (!combined) {
    styleEl?.remove();
    return;
  }

  const content = `@layer legacy {\n${combined}\n}`;

  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = LEGACY_LAYER_STYLE_ID;
    // Insert BEFORE the first <link rel="stylesheet"> so the @layer legacy
    // declaration is encountered before Tailwind's compiled layers.
    const firstLink = document.head.querySelector('link[rel="stylesheet"]');
    if (firstLink) {
      document.head.insertBefore(styleEl, firstLink);
    } else {
      document.head.insertBefore(styleEl, document.head.firstChild);
    }
  }

  if (styleEl.textContent !== content) {
    styleEl.textContent = content;
  }
}

/**
 * Remove the layered `<style>` tag.
 */
function removeLegacyLayered() {
  document.getElementById(LEGACY_LAYER_STYLE_ID)?.remove();
}

export function LegacyStylesheetManager() {
  const pathname = usePathname() || "";

  useLayoutEffect(() => {
    const isAdmin = pathname.startsWith("/admin");

    if (isAdmin) {
      // Admin pages: header/footer CSS as normal <link> tags (unlayered,
      // same behaviour as /account/profile), only website.css in @layer legacy
      // to protect admin content from the destructive `*` universal reset.
      syncLegacyLinks(ADMIN_DASHBOARD_UNLAYERED);
      void injectLegacyLayered(ADMIN_DASHBOARD_LAYERED);
    } else {
      // Public pages: load as normal <link> tags.
      removeLegacyLayered();
      syncLegacyLinks(PUBLIC_LEGACY_STYLESHEETS);
    }
  }, [pathname]);

  return null;
}
