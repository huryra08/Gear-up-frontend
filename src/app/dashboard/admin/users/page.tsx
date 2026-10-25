"use client";

import { useEffect, useState } from "react";
import { adminApi, authApi, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input, Label, Select } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [creatingProvider, setCreatingProvider] = useState(false);
  const [providerName, setProviderName] = useState("");
  const [providerEmail, setProviderEmail] = useState("");
  const [providerPassword, setProviderPassword] = useState("");
  const [providerPhone, setProviderPhone] = useState("");

  const load = () => {
    adminApi
      .users({ searchTerm: searchTerm || undefined, role: role || undefined })
      .then(setUsers)
      .catch(() => setUsers([]));
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, role]);

  const toggleStatus = async (user: User) => {
    const next = user.activeStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    setUpdating(user.id);
    try {
      await adminApi.updateUserStatus(user.id, next);
      toast.success(`${user.name} is now ${next.toLowerCase()}`);
      setUsers((prev) => prev?.map((u) => (u.id === user.id ? { ...u, activeStatus: next } : u)) ?? null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update that user.");
    } finally {
      setUpdating(null);
    }
  };

  const createProvider = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreatingProvider(true);
    try {
      await authApi.register({
        name: providerName.trim(),
        email: providerEmail.trim(),
        password: providerPassword,
        phone: providerPhone.trim(),
        role: "PROVIDER",
      });
      toast.success("Provider account created.");
      setProviderName("");
      setProviderEmail("");
      setProviderPassword("");
      setProviderPhone("");
      setShowProviderForm(false);
      setSearchTerm("");
      setRole("PROVIDER");
      setPage(1);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't create the provider account.");
    } finally {
      setCreatingProvider(false);
    }
  };

  const totalPages = users ? Math.max(1, Math.ceil(users.length / PAGE_SIZE)) : 1;
  const pageUsers = users?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <p className="tag-label text-rust mb-2">Admin dashboard</p>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-forest">User Management</h1>
        <Button type="button" onClick={() => setShowProviderForm((visible) => !visible)}>
          <Plus aria-hidden="true" className="h-4 w-4" />
          {showProviderForm ? "Cancel" : "Create Provider"}
        </Button>
      </div>

      {showProviderForm && (
        <form
          onSubmit={createProvider}
          className="mb-8 grid grid-cols-1 gap-4 border border-line bg-paper p-6 sm:grid-cols-2"
        >
          <div>
            <Label htmlFor="provider-name">Provider name</Label>
            <Input
              id="provider-name"
              value={providerName}
              onChange={(event) => setProviderName(event.target.value)}
              placeholder="Trailhead Gear Co"
              autoComplete="organization"
              required
              minLength={2}
            />
          </div>
          <div>
            <Label htmlFor="provider-email">Email</Label>
            <Input
              id="provider-email"
              type="email"
              value={providerEmail}
              onChange={(event) => setProviderEmail(event.target.value)}
              placeholder="provider@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <Label htmlFor="provider-password">Temporary password</Label>
            <PasswordInput
              id="provider-password"
              value={providerPassword}
              onChange={(event) => setProviderPassword(event.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>
          <div>
            <Label htmlFor="provider-phone">Phone</Label>
            <Input
              id="provider-phone"
              type="tel"
              value={providerPhone}
              onChange={(event) => setProviderPhone(event.target.value)}
              placeholder="+8801800000000"
              autoComplete="tel"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={creatingProvider}>
              {creatingProvider ? "Creating…" : "Create Provider"}
            </Button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft" />
          <Input
            className="pl-8"
            placeholder="Search by name or email…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          className="max-w-[180px]"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="PROVIDER">Provider</option>
          <option value="ADMIN">Admin</option>
        </Select>
      </div>

      {!users && <p className="text-sm text-ink-soft">Loading users…</p>}
      {users && users.length === 0 && <p className="text-sm text-ink-soft">No users found.</p>}

      {users && users.length > 0 && (
        <>
          <div className="border border-line bg-paper overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="tag-label text-ink-soft border-b border-line text-left">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {pageUsers.map((u) => (
                  <tr key={u.id} className="border-b border-line last:border-0">
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3 text-ink-soft">{u.email}</td>
                    <td className="p-3">{u.role}</td>
                    <td className="p-3">
                      <StatusBadge status={u.activeStatus} />
                    </td>
                    <td className="p-3 text-right">
                      {u.role !== "ADMIN" && (
                        <Button
                          size="sm"
                          variant={u.activeStatus === "ACTIVE" ? "danger" : "secondary"}
                          disabled={updating === u.id}
                          onClick={() => toggleStatus(u)}
                        >
                          {u.activeStatus === "ACTIVE" ? "Suspend" : "Activate"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`h-8 w-8 text-sm border ${page === i + 1 ? "border-rust text-rust-deep" : "border-line text-ink-soft"}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
