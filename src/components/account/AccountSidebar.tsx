"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { LogOut, ChevronRight, Crown } from "lucide-react";
import {
  accountSidebarConfig,
  logoutItem,
  getAvailableSections,
  type UserRole,
  type UserPlan,
} from "@/lib/config/accountSidebar";

interface AccountSidebarProps {
  userRole: UserRole;
  userPlan: UserPlan;
  userName?: string;
  userEmail?: string;
}

export function AccountSidebar({
  userRole,
  userPlan,
  userName,
  userEmail,
}: AccountSidebarProps) {
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const availableSections = getAvailableSections(userRole, userPlan);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  const getPlanLabel = (plan: UserPlan) => {
    switch (plan) {
      case "enterprise":
        return "Enterprise";
      case "pro":
        return "Professional";
      default:
        return "Free";
    }
  };

  return (
    <div style={{ width: '100%', backgroundColor: '#ffffff', borderRight: '1px solid #e5e7eb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* User Info Card - Minimalist Design */}
      <div style={{ padding: '24px 16px', margin: '16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Avatar */}
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', flexShrink: 0 }}>
            {getInitials(userName || "")}
          </div>
          {/* User Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName || "User"}</h3>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</p>
          </div>
        </div>
        {/* Role and Plan Badges */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ padding: '4px 12px', backgroundColor: 'white', color: '#374151', fontSize: '11px', fontWeight: '600', borderRadius: '20px', border: '1px solid #d1d5db' }}>
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </div>
          <div style={{ padding: '4px 12px', backgroundColor: '#000000', color: 'white', fontSize: '11px', fontWeight: '600', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {userPlan !== 'free' && <Crown style={{ width: '12px', height: '12px' }} />}
            {getPlanLabel(userPlan)}
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
        {availableSections.map((section) => (
          <div key={section.title}>
            <h4 style={{ padding: '0 16px', paddingBottom: '12px', fontSize: '11px', fontWeight: '700', color: '#9ca3af', margin: '0', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f3f4f6' }}>
              {section.title}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px' }}>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = pathname && (pathname === item.href || pathname.startsWith(item.href + "/"));

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      backgroundColor: active ? '#000000' : 'transparent',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    title={item.description}
                  >
                    <Icon
                      style={{
                        width: '18px',
                        height: '18px',
                        flexShrink: 0,
                        color: active ? 'white' : '#9ca3af',
                        transition: 'color 0.2s ease'
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '500', fontSize: '13px', color: active ? 'white' : '#111827', margin: 0 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '11px', color: active ? '#f3f4f6' : '#9ca3af', margin: '2px 0 0 0' }}>
                        {item.description}
                      </div>
                    </div>
                    {item.badge && (
                      <span style={{ marginLeft: '8px', padding: '2px 8px', fontSize: '10px', fontWeight: 'bold', borderRadius: '12px', backgroundColor: active ? 'rgba(255,255,255,0.2)' : '#dc2626', color: active ? 'white' : 'white' }}>
                        {item.badge}
                      </span>
                    )}
                    {active && <ChevronRight style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.6)' }} />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout Button at Bottom */}
      <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', backgroundColor: 'white' }}>
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '10px',
            color: '#6b7280',
            border: '1px solid #e5e7eb',
            backgroundColor: 'white',
            cursor: isSigningOut ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            fontSize: '13px',
            transition: 'all 0.2s ease',
            opacity: isSigningOut ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!isSigningOut) {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.color = '#111827';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          <LogOut style={{ width: '16px', height: '16px' }} />
          <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );
}
