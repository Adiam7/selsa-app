"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function RouteAwareFrame({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminDashboard = pathname === "/admin/dashboard" || pathname.startsWith("/admin/dashboard/");
  const shouldShowSiteChrome = !isAdminRoute || isAdminDashboard;

  const Wrapper: any = shouldShowSiteChrome ? "main" : "div";

  return (
    <>
      {shouldShowSiteChrome ? header : null}
      <Wrapper
        className={cn(
          "flex-1",
          shouldShowSiteChrome && "ins-tiles--main layout-main",
          !shouldShowSiteChrome && "min-h-screen"
        )}
      >
        {children}
      </Wrapper>
      {shouldShowSiteChrome ? footer : null}
    </>
  );
}
