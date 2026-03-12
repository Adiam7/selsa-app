/**
 * Account Sidebar Configuration
 * Defines navigation items based on role and plan
 */

import {
  User,
  Building2,
  Users,
  CreditCard,
  Lock,
  Bell,
  LogOut,
  LucideIcon,
  Code2,
  Zap,
  BarChart3,
  Key,
  Webhook,
  FileText,
  Shield,
  CheckCircle,
  HelpCircle,
  Mail,
  Package,
} from "lucide-react";

export type UserRole = "admin" | "member" | "guest";
export type UserPlan = "free" | "pro" | "enterprise";

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  requiredRole?: UserRole[];
  requiredPlan?: UserPlan[];
  badge?: string;
  description: string;
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

/**
 * Personal Settings Section
 * Available to all authenticated users
 */
export const personalSettingsItems: SidebarItem[] = [
  {
    id: "profile",
    label: "Profile",
    href: "/account/profile",
    icon: User,
    description: "Manage your personal information",
  },
  {
    id: "orders",
    label: "Orders",
    href: "/account/orders",
    icon: Package,
    description: "View and track your orders",
  },
  {
    id: "security",
    label: "Security",
    href: "/account/security",
    icon: Lock,
    description: "Password and two-factor authentication",
  },
  {
    id: "notifications",
    label: "Notifications",
    href: "/account/notifications",
    icon: Bell,
    description: "Email and notification preferences",
  },
];

/**
 * Workspace Settings Section
 * Available to all users (admin can manage, others can view)
 */
export const workspaceSettingsItems: SidebarItem[] = [
  {
    id: "workspace-general",
    label: "General",
    href: "/account/workspace",
    icon: Building2,
    description: "Workspace settings and general info",
  },
  {
    id: "team",
    label: "Team & Roles",
    href: "/account/team",
    icon: Users,
    description: "Manage team members and roles",
  },
  {
    id: "billing",
    label: "Billing",
    href: "/account/billing",
    icon: CreditCard,
    description: "Billing and subscription management",
  },
  {
    id: "usage",
    label: "Usage",
    href: "/account/usage",
    icon: BarChart3,
    description: "Track resource usage and limits",
  },
];

/**
 * Developer Section
 * Available to all users
 */
export const developerItems: SidebarItem[] = [
  {
    id: "api-keys",
    label: "API Keys",
    href: "/account/api-keys",
    icon: Key,
    description: "Manage API keys and tokens",
  },
  {
    id: "webhooks",
    label: "Webhooks",
    href: "/account/webhooks",
    icon: Webhook,
    description: "Configure webhooks and integrations",
  },
];

/**
 * Advanced Section (Enterprise)
 * Available to all users
 */
export const advancedItems: SidebarItem[] = [
  {
    id: "audit-logs",
    label: "Audit Logs",
    href: "/account/audit-logs",
    icon: FileText,
    description: "View account activity and audit trail",
  },
  {
    id: "sso",
    label: "SSO",
    href: "/account/sso",
    icon: Shield,
    description: "Single sign-on configuration",
  },
  {
    id: "compliance",
    label: "Compliance",
    href: "/account/compliance",
    icon: CheckCircle,
    description: "Compliance and security settings",
  },
];

/**
 * Support Section
 * Available to all users
 */
export const supportItems: SidebarItem[] = [
  {
    id: "help",
    label: "Help",
    href: "/account/help",
    icon: HelpCircle,
    description: "Documentation and FAQs",
  },
  {
    id: "contact-support",
    label: "Contact Support",
    href: "/account/contact-support",
    icon: Mail,
    description: "Get help from our support team",
  },
];

/**
 * Account Sidebar Configuration Structure
 */
export const accountSidebarConfig: SidebarSection[] = [
  {
    title: "Account",
    items: personalSettingsItems,
  },
  {
    title: "Workspace",
    items: workspaceSettingsItems,
  },
  {
    title: "Developer",
    items: developerItems,
  },
  {
    title: "Advanced",
    items: advancedItems,
  },
  {
    title: "Support",
    items: supportItems,
  },
];

/**
 * Logout Item
 * Always available at the bottom
 */
export const logoutItem: SidebarItem = {
  id: "logout",
  label: "Sign Out",
  href: "#logout",
  icon: LogOut,
  description: "Sign out of your account",
};

/**
 * Filter sidebar items based on user role and plan
 */
export function filterSidebarItems(
  items: SidebarItem[],
  userRole: UserRole,
  userPlan: UserPlan
): SidebarItem[] {
  return items.filter((item) => {
    // Check role requirement
    if (item.requiredRole && !item.requiredRole.includes(userRole)) {
      return false;
    }

    // Check plan requirement
    if (item.requiredPlan && !item.requiredPlan.includes(userPlan)) {
      return false;
    }

    return true;
  });
}

/**
 * Get available sections for user
 */
export function getAvailableSections(
  userRole: UserRole,
  userPlan: UserPlan
): SidebarSection[] {
  const availableSections: SidebarSection[] = [];

  // Personal section (always available)
  availableSections.push({
    title: "Account",
    items: filterSidebarItems(personalSettingsItems, userRole, userPlan),
  });

  // Workspace section (all users)
  const workspaceItems = filterSidebarItems(
    workspaceSettingsItems,
    userRole,
    userPlan
  );
  if (workspaceItems.length > 0) {
    availableSections.push({
      title: "Workspace",
      items: workspaceItems,
    });
  }

  // Developer section (all users)
  const developerItemsFiltered = filterSidebarItems(
    developerItems,
    userRole,
    userPlan
  );
  if (developerItemsFiltered.length > 0) {
    availableSections.push({
      title: "Developer",
      items: developerItemsFiltered,
    });
  }

  // Advanced section (all users)
  const advancedItemsFiltered = filterSidebarItems(
    advancedItems,
    userRole,
    userPlan
  );
  if (advancedItemsFiltered.length > 0) {
    availableSections.push({
      title: "Advanced",
      items: advancedItemsFiltered,
    });
  }

  // Support section (all users)
  const supportItemsFiltered = filterSidebarItems(
    supportItems,
    userRole,
    userPlan
  );
  if (supportItemsFiltered.length > 0) {
    availableSections.push({
      title: "Support",
      items: supportItemsFiltered,
    });
  }

  return availableSections;
}

/**
 * Check if user has access to specific page
 */
export function canAccessPage(
  pageId: string,
  userRole: UserRole,
  userPlan: UserPlan
): boolean {
  const allItems = [
    ...personalSettingsItems,
    ...workspaceSettingsItems,
    ...developerItems,
    ...advancedItems,
    ...supportItems,
  ];

  const item = allItems.find((i) => i.id === pageId);
  if (!item) return false;

  if (item.requiredRole && !item.requiredRole.includes(userRole)) {
    return false;
  }

  if (item.requiredPlan && !item.requiredPlan.includes(userPlan)) {
    return false;
  }

  return true;
}
