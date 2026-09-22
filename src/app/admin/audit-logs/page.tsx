import { AuditService } from "@/features/audit/audit.service";
import { requireAdmin } from "@/lib/auth/rbac";
import { formatDate } from "@/lib/utils";
import { FileText, Shield } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminAuditLogsPage() {
  await requireAdmin();
  const logs = await AuditService.list(50);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          System Audit Logs
        </h1>
        <p className="text-xs text-zinc-500">Immutable chronological record of administrative actions, pricing edits, and security changes</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Audit Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4 text-zinc-400 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  <td className="p-4 whitespace-nowrap">
                    {log.actor ? (
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-sans">
                        {log.actor.firstName} ({log.actor.email})
                      </span>
                    ) : (
                      <span className="text-zinc-400 font-sans">SYSTEM</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-600 dark:text-zinc-400">
                    {log.entityType} ({log.entityId || "N/A"})
                  </td>
                  <td className="p-4 max-w-xs truncate text-zinc-500">
                    {log.newValue || log.oldValue || "-"}
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
