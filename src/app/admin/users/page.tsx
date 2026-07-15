"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, Column } from "@/components/data/data-table";
import { StatusBadge } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ROLES, ELEVATED_ROLES } from "@/lib/constants";
import { LoadingState } from "@/components/shared/loading-state";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface UserSession {
  id: string;
  token: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
}

const ALL_ROLES: string[] = [
  ROLES.APPLICANT,
  ROLES.STAFF,
  ROLES.ADMIN,
  ROLES.PRINCIPAL,
  ROLES.FINANCE,
  ROLES.SUPER_ADMIN,
];

const RESTRICTED_ROLES: string[] = [
  ROLES.STAFF,
  ROLES.FINANCE,
  ROLES.PRINCIPAL,
  ROLES.APPLICANT,
];

function getColumns(
  currentRole: string | undefined,
  currentUserId: string | undefined,
  onRoleChange: (row: UserItem, newRole: string) => void,
  onBanToggle: (row: UserItem) => void,
  onViewSessions: (row: UserItem) => void,
  busyId: string | null
): Column<UserItem>[] {
  const isSuperAdmin = currentRole === ROLES.SUPER_ADMIN;
  const selectableRoles = isSuperAdmin ? ALL_ROLES : RESTRICTED_ROLES;

  return [
    {
      key: "name",
      header: "Nama",
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "email",
      header: "Email",
      cell: (row) => <span className="text-muted-foreground">{row.email}</span>,
    },
    {
      key: "role",
      header: "Role",
      cell: (row) => {
        const rowIsElevated = ELEVATED_ROLES.includes(row.role);
        const disabled = !isSuperAdmin && rowIsElevated;

        return (
          <select
            value={row.role}
            disabled={disabled}
            title={
              disabled
                ? "Hanya Super Admin yang dapat mengubah role ini"
                : undefined
            }
            onChange={(e) => onRoleChange(row, e.target.value)}
            className="h-9 rounded-md border border-border bg-white px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {/* Ensure the current role is always shown even if not in the selectable list */}
            {!selectableRoles.includes(row.role) && (
              <option value={row.role}>{row.role}</option>
            )}
            {selectableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge
          status={row.status === "banned" ? "REJECTED" : row.status === "pending" ? "PENDING" : "VERIFIED"}
        />
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (row) => {
        const rowIsElevated = ELEVATED_ROLES.includes(row.role);
        const isSelf = row.id === currentUserId;
        const canManage = !isSelf && (isSuperAdmin || !rowIsElevated);

        return (
          <div className="flex items-center gap-2">
            {canManage && (
              <Button
                size="sm"
                variant="outline"
                disabled={busyId === row.id}
                onClick={() => onBanToggle(row)}
              >
                {busyId === row.id ? "..." : row.status === "banned" ? "Aktifkan" : "Nonaktifkan"}
              </Button>
            )}
            {isSuperAdmin && !isSelf && (
              <Button size="sm" variant="outline" onClick={() => onViewSessions(row)}>
                Sesi Aktif
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}

export default function UsersPage() {
  const { data: authSession } = authClient.useSession();
  const currentRole = (authSession?.user as { role?: string } | undefined)?.role;
  const currentUserId = authSession?.user?.id;

  const [data, setData] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "", password: "", role: ROLES.APPLICANT as string });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [sessionsFor, setSessionsFor] = useState<UserItem | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const loadUsers = () => {
    fetch("/api/users")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const isSuperAdmin = currentRole === ROLES.SUPER_ADMIN;
  const creatableRoles = isSuperAdmin ? ALL_ROLES : RESTRICTED_ROLES;

  const handleCreate = async () => {
    setFormError("");
    if (!draft.name || !draft.email || draft.password.length < 8) {
      setFormError("Lengkapi nama, email, dan password (minimal 8 karakter)");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(body?.error ?? "Gagal membuat pengguna");
        return;
      }
      setDraft({ name: "", email: "", password: "", role: ROLES.APPLICANT });
      setShowForm(false);
      loadUsers();
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (row: UserItem, newRole: string) => {
    const previousRole = row.role;

    // Optimistically update local state.
    setData((prev) =>
      prev.map((u) => (u.id === row.id ? { ...u, role: newRole } : u))
    );

    try {
      const res = await fetch(`/api/users/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        // Revert optimistic update on failure.
        setData((prev) =>
          prev.map((u) => (u.id === row.id ? { ...u, role: previousRole } : u))
        );
        alert(body?.error ?? "Gagal mengubah role pengguna");
        return;
      }

      const updated = await res.json();
      setData((prev) =>
        prev.map((u) => (u.id === row.id ? { ...u, role: updated.role } : u))
      );
    } catch (error) {
      console.error("Failed to update role:", error);
      setData((prev) =>
        prev.map((u) => (u.id === row.id ? { ...u, role: previousRole } : u))
      );
      alert("Gagal mengubah role pengguna");
    }
  };

  const handleBanToggle = async (row: UserItem) => {
    const action = row.status === "banned" ? "unban" : "ban";
    if (action === "ban" && !confirm(`Nonaktifkan akun ${row.name}? Pengguna tidak akan bisa masuk lagi sampai diaktifkan kembali.`)) {
      return;
    }
    setBusyId(row.id);
    try {
      const res = await fetch(`/api/users/${row.id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(body?.error ?? "Gagal memproses aksi");
        return;
      }
      loadUsers();
    } finally {
      setBusyId(null);
    }
  };

  const handleViewSessions = async (row: UserItem) => {
    setSessionsFor(row);
    setSessionsLoading(true);
    try {
      const res = await fetch(`/api/users/${row.id}/sessions`);
      const body = await res.json().catch(() => []);
      setSessions(Array.isArray(body) ? body : []);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionToken: string) => {
    if (!sessionsFor) return;
    await fetch(`/api/users/${sessionsFor.id}/sessions`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionToken }),
    });
    handleViewSessions(sessionsFor);
  };

  const handleRevokeAllSessions = async () => {
    if (!sessionsFor) return;
    if (!confirm(`Paksa logout semua sesi aktif ${sessionsFor.name}?`)) return;
    await fetch(`/api/users/${sessionsFor.id}/sessions`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    handleViewSessions(sessionsFor);
  };

  const columns = getColumns(currentRole, currentUserId, handleRoleChange, handleBanToggle, handleViewSessions, busyId);

  return (
    <div>
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola pengguna sistem PPDB"
        actions={
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pengguna
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-headline-md">Pengguna Baru</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {formError && (
              <div className="sm:col-span-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Lengkap</label>
              <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password Awal</label>
              <Input type="password" placeholder="Minimal 8 karakter" value={draft.password} onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={draft.role} onValueChange={(v) => setDraft((d) => ({ ...d, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {creatableRoles.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <Button onClick={handleCreate} disabled={saving}>{saving ? "Menyimpan..." : "Buat Pengguna"}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            </div>
            <p className="sm:col-span-2 text-xs text-muted-foreground">
              Bagikan password awal ini secara manual kepada pengguna — belum ada layanan email untuk mengirimkannya otomatis.
            </p>
          </CardContent>
        </Card>
      )}

      {sessionsFor && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-headline-md">Sesi Aktif — {sessionsFor.name}</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setSessionsFor(null)}>Tutup</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessionsLoading ? (
              <p className="text-sm text-muted-foreground">Memuat...</p>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tidak ada sesi aktif.</p>
            ) : (
              <>
                {sessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                    <div className="text-sm">
                      <p className="font-medium">{s.ipAddress ?? "IP tidak diketahui"}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-md">{s.userAgent ?? "-"}</p>
                      <p className="text-xs text-muted-foreground">
                        Login: {new Date(s.createdAt).toLocaleString("id-ID")} · Kedaluwarsa: {new Date(s.expiresAt).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleRevokeSession(s.token)}>
                      Paksa Logout
                    </Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={handleRevokeAllSessions}>
                  Logout Semua Sesi
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <LoadingState rows={5} />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          searchable
          searchKeys={["name", "email"]}
        />
      )}
    </div>
  );
}
