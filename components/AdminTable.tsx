"use client";
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Download, Search, CheckCircle, XCircle, Clock, Loader2, ArrowUpDown } from "lucide-react";
import toast from "react-hot-toast";

export interface ColumnDef {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

type AdminEditableField = "batch" | "comments" | "payableAmount" | "paidAmount";

interface AdminTableProps {
  collectionName: string;
  columns: ColumnDef[];
  title: string;
  showStatusActions?: boolean;
  /** Extra Firestore-backed fields the admin can edit inline, rendered as their own columns. */
  adminEditableFields?: AdminEditableField[];
}

const FIELD_LABELS: Record<AdminEditableField, string> = {
  batch: "Batch",
  payableAmount: "Payable",
  paidAmount: "Paid",
  comments: "Comments",
};

export default function AdminTable({
  collectionName, columns, title, showStatusActions = true, adminEditableFields = [],
}: AdminTableProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"createdAt" | "batch">("createdAt");

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [collectionName]);

  const filtered = useMemo(() => {
    let list = rows;
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((r) => Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(s)));
    }
    if (sortField === "batch") {
      list = [...list].sort((a, b) => String(a.batch ?? "").localeCompare(String(b.batch ?? "")));
    }
    return list;
  }, [rows, search, sortField]);

  // Approving goes through /api/admin/approve so it also emails the student
  // (via the Apps Script webhook) and defaults paidAmount to the payable
  // amount if it hasn't been set yet.
  async function handleApprove(id: string) {
    const user = auth.currentUser;
    if (!user) {
      toast.error("লগইন করুন");
      return;
    }
    setApprovingId(id);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ collection: collectionName, id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Approval failed");

      if (data.emailSent) {
        toast.success("Approved — confirmation email sent ✅");
      } else {
        toast.error(`Approved, but email failed: ${data.emailError || "unknown error"}`, { duration: 6000 });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setApprovingId(null);
    }
  }

  async function handleReject(id: string) {
    try {
      await updateDoc(doc(db, collectionName, id), { status: "Rejected" });
      toast.success("Status updated to Rejected");
    } catch {
      toast.error("Update failed");
    }
  }

  async function updateField(id: string, field: AdminEditableField, value: string | number) {
    try {
      await updateDoc(doc(db, collectionName, id), { [field]: value });
      toast.success(`${FIELD_LABELS[field]} updated`);
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

  const extraColCount = adminEditableFields.length;
  const totalColSpan = columns.length + 1 + extraColCount;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-xl md:text-2xl font-bold text-navy font-poppins">{title} <span className="text-gray-400 text-base font-normal">({filtered.length})</span></h1>
        <div className="flex items-center gap-2">
          {adminEditableFields.includes("batch") && (
            <button
              onClick={() => setSortField((f) => (f === "batch" ? "createdAt" : "batch"))}
              className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border ${
                sortField === "batch" ? "bg-navy text-white border-navy" : "border-gray-300 text-gray-600"
              }`}
              title="Toggle sorting by batch"
            >
              <ArrowUpDown size={14} /> {sortField === "batch" ? "Sorted: Batch" : "Sort by Batch"}
            </button>
          )}
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
              {adminEditableFields.map((f) => (
                <th key={f} className="text-left px-4 py-3 whitespace-nowrap">{FIELD_LABELS[f]}</th>
              ))}
              {showStatusActions && <th className="px-4 py-3 text-left">Status / Action</th>}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={totalColSpan} className="text-center py-10 text-gray-400">Loading...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={totalColSpan} className="text-center py-10 text-gray-400">No records found</td></tr>
            )}
            {filtered.map((row, i) => (
              <tr key={row.id} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 whitespace-nowrap max-w-[220px] truncate">
                    {c.render ? c.render(row[c.key], row) : String(row[c.key] ?? "-")}
                  </td>
                ))}

                {adminEditableFields.map((field) => (
                  <td key={field} className="px-4 py-3 whitespace-nowrap">
                    <EditableCell
                      value={row[field] ?? (field === "payableAmount" || field === "paidAmount" ? 0 : "")}
                      type={field === "payableAmount" || field === "paidAmount" ? "number" : "text"}
                      onSave={(v) =>
                        updateField(
                          row.id,
                          field,
                          field === "payableAmount" || field === "paidAmount" ? Number(v) || 0 : v
                        )
                      }
                    />
                  </td>
                ))}

                {showStatusActions && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={row.status} />
                      {row.status !== "Approved" && (
                        <button
                          onClick={() => handleApprove(row.id)}
                          disabled={approvingId === row.id}
                          className="text-green-600 hover:text-green-800 disabled:opacity-50"
                          title="Approve & email student"
                        >
                          {approvingId === row.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                        </button>
                      )}
                      {row.status !== "Rejected" && (
                        <button
                          onClick={() => handleReject(row.id)}
                          disabled={approvingId === row.id}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                          title="Reject"
                        >
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

function EditableCell({
  value, onSave, type = "text",
}: { value: string | number; onSave: (v: string) => void; type?: "text" | "number" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ""));

  useEffect(() => { setDraft(String(value ?? "")); }, [value]);

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-left hover:underline decoration-dotted decoration-gray-400 text-gray-700 max-w-[160px] truncate block"
        title="Click to edit"
      >
        {value === "" || value === undefined || value === null ? <span className="text-gray-300">—</span> : String(value)}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        autoFocus
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        onBlur={commit}
        className="border border-navy/40 rounded px-1.5 py-1 text-xs w-24"
      />
    </div>
  );

  function commit() {
    setEditing(false);
    if (draft !== String(value ?? "")) onSave(draft);
  }
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