"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, Column } from "@/components/data/data-table";
import { StatusBadge } from "@/components/data/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface UserItem {
  name: string;
  email: string;
  role: string;
  status: string;
}

const columns: Column<UserItem>[] = [
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
    cell: (row) => <Badge variant="secondary">{row.role}</Badge>,
  },
  {
    key: "status",
    header: "Status",
    cell: (row) => (
      <StatusBadge status={row.status === "active" ? "VERIFIED" : "REJECTED"} />
    ),
  },
];

export default function UsersPage() {
  const [data, setData] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola pengguna sistem PPDB"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pengguna
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={data}
        searchable
        searchKeys={["name", "email"]}
      />
    </div>
  );
}
