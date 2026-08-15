"use client";
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Download, Search, CheckCircle, XCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

export interface ColumnDef {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface AdminTableProps {
  collectionName: string;
  columns: ColumnDef[];
  title: string;
  showStatusActions?: boolean;
}

export default function AdminTable({ collectionName, columns, title, showStatusActions = true }: AdminTableProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [collectionName]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const s = search.toLowerCase();
    return rows.filter((r) => Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(s)));
  }, [rows, search]);

  async function updateStatus(id: string, status: string) {
    try {
      await updateDoc(doc(db, collectionName, id), { status });
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error("Update failed");
    }
  }

  function exportCsv() {
    if (!filtered.length) return;
    const headers = columns.map((c) => c.label);
    const csvRows = filtered.map((r) => columns.map((c) => `"${String(r[c.key] ?? "").replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${collectionName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-xl md:text-2xl font-bold text-navy font-poppins">{title} <span className="text-gray-400 text-base font-normal">({filtered.length})</span></h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy/30" />
          </div>
          <button onClick={exportCsv} className="flex items-center gap-1.5 bg-navy text-white text-sm px-3 py-2 rounded-lg hover:bg-navy-light">
            <Download size={16} /> CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-navy text-white">
            <tr>
              {columns.map((c) => <th key={c.key} className="text-left px-4 py-3 whitespace-nowrap">{c.label}</th>)}
              {showStatusActions && <th className="px-4 py-3 text-left">Status / Action</th>}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={columns.length + 1} className="text-center py-10 text-gray-400">Loading...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={columns.length + 1} className="text-center py-10 text-gray-400">No records found</td></tr>
            )}
            {filtered.map((row, i) => (
              <tr key={row.id} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 whitespace-nowrap max-w-[220px] truncate">
                    {c.render ? c.render(row[c.key], row) : String(row[c.key] ?? "-")}
                  </td>
                ))}
                {showStatusActions && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={row.status} />
                      {row.status !== "Approved" && (
                        <button onClick={() => updateStatus(row.id, "Approved")} className="text-green-600 hover:text-green-800" title="Approve">
                          <CheckCircle size={18} />
                        </button>
                      )}
                      {row.status !== "Rejected" && (
                        <button onClick={() => updateStatus(row.id, "Rejected")} className="text-red-500 hover:text-red-700" title="Reject">
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, string> = {
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Pending: "bg-yellow-100 text-yellow-700",
  };
  const cls = map[status || "Pending"] || map.Pending;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${cls}`}>
      {status === "Approved" ? <CheckCircle size={12} /> : status === "Rejected" ? <XCircle size={12} /> : <Clock size={12} />}
      {status || "Pending"}
    </span>
  );
}
