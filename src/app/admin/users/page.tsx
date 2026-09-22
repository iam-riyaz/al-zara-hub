import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/rbac";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Users, Shield } from "lucide-react";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true, reviews: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Customer & Staff Directory
        </h1>
        <p className="text-xs text-zinc-500">View registered customer profiles, administrative privileges, and engagement stats</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Orders Placed</th>
                <th className="p-4">Reviews</th>
                <th className="p-4">Member Since</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4 font-bold text-zinc-900 dark:text-white">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="p-4 text-zinc-500">{u.email}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 font-bold text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-zinc-700 dark:text-zinc-300">
                    {u._count.orders} orders
                  </td>
                  <td className="p-4 text-zinc-500">{u._count.reviews}</td>
                  <td className="p-4 text-zinc-400">{formatDate(u.createdAt)}</td>
                  <td className="p-4">
                    <Badge variant={u.status === "ACTIVE" ? "success" : "destructive"} className="text-[10px]">
                      {u.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
