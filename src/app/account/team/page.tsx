"use client";

import { AccountLayout } from "@/components/account/AccountLayout";
import { Users, Mail, Trash2, Plus, Shield, User } from "lucide-react";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  joinedDate: string;
  status: "active" | "pending";
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Alina",
      email: "alina.09me@gmail.com",
      role: "admin",
      joinedDate: "Jan 24, 2026",
      status: "active",
    },
    {
      id: "2",
      name: "John Doe",
      email: "john@example.com",
      role: "member",
      joinedDate: "Jan 20, 2026",
      status: "active",
    },
    {
      id: "3",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "member",
      joinedDate: "Jan 15, 2026",
      status: "pending",
    },
  ]);
  const { t } = useTranslation();

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");

  const handleInvite = async () => {
    if (!inviteEmail) return;

    try {
      const res = await fetch("/api/account/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to invite member");
        return;
      }

      // Optimistically add to local state
      setMembers((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: inviteEmail.split("@")[0],
          email: inviteEmail,
          role: inviteRole,
          joinedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          status: "pending" as const,
        },
      ]);
    } catch {
      alert("Failed to invite member");
    }

    setInviteEmail("");
    setInviteRole("member");
    setShowInviteForm(false);
  };

  const handleRemove = async (memberId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      try {
        const res = await fetch(`/api/account/team?memberId=${memberId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(data.error || "Failed to remove member");
          return;
        }
      } catch {
        alert("Failed to remove member");
        return;
      }

      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    }
  };

  const handleChangeRole = async (memberId: string, newRole: "admin" | "member") => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );

    try {
      const res = await fetch("/api/account/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role: newRole }),
      });

      if (!res.ok) {
        // Revert on failure
        setMembers((prev) =>
          prev.map((m) =>
            m.id === memberId ? { ...m, role: newRole === "admin" ? "member" : "admin" } : m
          )
        );
      }
    } catch {
      // Revert on failure
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId ? { ...m, role: newRole === "admin" ? "member" : "admin" } : m
        )
      );
    }
  };

  return (
    <AccountLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0', marginBottom: '8px' }}>{t('Team Members')}</h1>
            <p style={{ fontSize: '16px', color: '#4b5563', margin: '0' }}>{t('Manage your team and their roles')}</p>
          </div>
          <button
            onClick={() => setShowInviteForm(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#000000',
              color: 'white',
              fontWeight: '600',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />{t('Invite Member')}</button>
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>{t('Invite Team Member')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>{t('Email Address')}</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="member@example.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>{t('Role')}</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "admin" | "member")}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="member">{t('Member')}</option>
                  <option value="admin">{t('Admin')}</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleInvite}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#000000',
                    color: 'white',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >{t('Send Invite')}</button>
                <button
                  onClick={() => setShowInviteForm(false)}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: 'white',
                    color: '#111827',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    cursor: 'pointer'
                  }}
                >{t('Cancel')}</button>
              </div>
            </div>
          </div>
        )}

        {/* Members List */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Users style={{ width: '20px', height: '20px', color: '#374151', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0' }}>{t('Team Members')}</h2>
                <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', marginTop: '4px' }}>{t('Total members:')}{members.length}</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {members.map((member, idx) => (
              <div
                key={member.id}
                style={{
                  padding: '16px 0',
                  borderBottom: idx < members.length - 1 ? '1px solid #e5e7eb' : 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '14px', flexShrink: 0 }}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: '600', color: '#111827', margin: '0' }}>{member.name}</h3>
                      <p style={{ fontSize: '12px', color: '#4b5563', margin: '0', marginTop: '2px' }}>{member.email}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{t('Joined')}{member.joinedDate}</span>
                    {member.status === "pending" && (
                      <span style={{ padding: '2px 8px', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '12px', fontWeight: '600', borderRadius: '4px' }}>{t('Pending')}</span>
                    )}
                  </div>
                </div>

                {/* Role Selector and Remove Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <select
                    value={member.role}
                    onChange={(e) =>
                      handleChangeRole(member.id, e.target.value as "admin" | "member")
                    }
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="member">{t('Member')}</option>
                    <option value="admin">{t('Admin')}</option>
                  </select>

                  {member.id !== "1" && (
                    <button
                      onClick={() => handleRemove(member.id)}
                      style={{
                        padding: '8px 12px',
                        color: '#8b5cf6',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '6px'
                      }}
                      title="Remove member"
                    >
                      <Trash2 style={{ width: '20px', height: '20px' }} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Information */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Shield style={{ width: '20px', height: '20px', color: '#374151', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0' }}>{t('Admin Role')}</h2>
                  <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', marginTop: '4px' }}>{t('Full account access')}</p>
                </div>
              </div>
            </div>
            <ul style={{ fontSize: '14px', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '12px', margin: 0, padding: 0, listStyle: 'none' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#000000', fontWeight: '700' }}>✓</span>{t('Manage team members')}</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#000000', fontWeight: '700' }}>✓</span>{t('Change workspace settings')}</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#000000', fontWeight: '700' }}>✓</span>{t('View billing and analytics')}</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#000000', fontWeight: '700' }}>✓</span>{t('Access all features')}</li>
            </ul>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <User style={{ width: '20px', height: '20px', color: '#374151', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0' }}>{t('Member Role')}</h2>
                  <p style={{ fontSize: '14px', color: '#4b5563', margin: '0', marginTop: '4px' }}>{t('Limited account access')}</p>
                </div>
              </div>
            </div>
            <ul style={{ fontSize: '14px', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '12px', margin: 0, padding: 0, listStyle: 'none' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#000000', fontWeight: '700' }}>✓</span>{t('View workspace data')}</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#000000', fontWeight: '700' }}>✓</span>{t('Manage own profile')}</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#000000', fontWeight: '700' }}>✓</span>{t('Use platform features')}</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#8b5cf6', fontWeight: '700' }}>✗</span>{t('Cannot manage team')}</li>
            </ul>
          </div>
        </div>

        {/* Info Box */}
        <div style={{ padding: '16px', background: 'linear-gradient(to right, #eff6ff, #faf5ff)', border: '1px solid #bfdbfe', borderRadius: '12px' }}>
          <p style={{ fontSize: '14px', color: '#1e3a8a', margin: '0' }}>{t('👥')}<strong>{t('Admin Only:')}</strong>{t('Only admins can manage team members and workspace settings.')}</p>
        </div>
      </div>
    </AccountLayout>
  );
}
