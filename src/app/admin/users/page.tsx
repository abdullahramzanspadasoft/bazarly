"use client";

import { useEffect, useState } from "react";
import { Shield, UserCircle } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge from "@/components/ui/Badge";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isPrimaryAdmin: boolean;
  createdAt: string;
}

interface RegularUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [users, setUsers] = useState<RegularUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (data.admins) setAdmins(data.admins);
        if (data.users) setUsers(data.users);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner className="py-16" />;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-1">Users Database</h1>
        <p className="text-sm text-neutral-500">All admin accounts and registered users from MongoDB</p>
      </div>

      {/* Admins Table */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Admins</h2>
          <span className="text-xs bg-black text-white px-2 py-0.5">{admins.length}</span>
        </div>

        <div className="border border-neutral-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left p-3 font-medium">#</th>
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Phone</th>
                <th className="text-left p-3 font-medium">Role</th>
                <th className="text-left p-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-neutral-500">
                    No admin accounts found
                  </td>
                </tr>
              ) : (
                admins.map((admin, i) => (
                  <tr key={admin._id} className="border-t border-neutral-200 hover:bg-neutral-50">
                    <td className="p-3 text-neutral-400">{i + 1}</td>
                    <td className="p-3 font-medium">{admin.name}</td>
                    <td className="p-3">
                      <span className="font-mono text-sm bg-neutral-100 px-2 py-1">{admin.email}</span>
                    </td>
                    <td className="p-3 text-neutral-500">{admin.phone || "—"}</td>
                    <td className="p-3">
                      <Badge variant={admin.isPrimaryAdmin ? "success" : "default"}>
                        {admin.isPrimaryAdmin ? "Primary Admin" : "Admin"}
                      </Badge>
                    </td>
                    <td className="p-3 text-neutral-500">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Users Table */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <UserCircle className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Users</h2>
          <span className="text-xs bg-neutral-200 text-neutral-700 px-2 py-0.5">{users.length}</span>
        </div>

        <div className="border border-neutral-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left p-3 font-medium">#</th>
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Phone</th>
                <th className="text-left p-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-neutral-500">
                    No registered users yet
                  </td>
                </tr>
              ) : (
                users.map((user, i) => (
                  <tr key={user._id} className="border-t border-neutral-200 hover:bg-neutral-50">
                    <td className="p-3 text-neutral-400">{i + 1}</td>
                    <td className="p-3 font-medium">{user.name}</td>
                    <td className="p-3">
                      <span className="font-mono text-sm bg-blue-50 text-blue-800 px-2 py-1">{user.email}</span>
                    </td>
                    <td className="p-3 text-neutral-500">{user.phone || "—"}</td>
                    <td className="p-3 text-neutral-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
