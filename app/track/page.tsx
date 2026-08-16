"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";

type Registration = {
  id: string;
  name: string;
  status: string;
  paymentStatus: string;
  serviceType: "course" | "mcq";
  payableAmount: number;
  paidAmount: number;
  trnxId: string;
  department: string;
  session: string;
  ihtName: string;
  comments: string;
  createdAt: string | null;
  approvedAt: string | null;
};

const STATUS_MAP: Record<string, { label: string; color: string; Icon: typeof CheckCircle2 }> = {
  verified: { label: "ভেরিফাইড ✅", color: "text-green-600 bg-green-50", Icon: CheckCircle2 },
  "manual-submitted": { label: "পর্যালোচনাধীন ⏳", color: "text-amber-600 bg-amber-50", Icon: Clock },
  "awaiting-gateway": { label: "পেমেন্টের অপেক্ষায়", color: "text-gray-500 bg-gray-50", Icon: Clock },
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("bn-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TrackPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[] | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRegistrations(null);
    try {
      const res = await fetch(
        `/api/track?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "পাওয়া যায়নি");
      setRegistrations(data.registrations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "কিছু একটা সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-xl mx-auto px-6 py-20">
      <h1 className="text-2xl font-bold text-navy mb-6 text-center">পেমেন্ট স্ট্যাটাস চেক করুন</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">ইমেইল</label>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="রেজিস্ট্রেশনে ব্যবহৃত ইমেইল"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">ফোন নাম্বার</label>
          <input
            type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="রেজিস্ট্রেশনে ব্যবহৃত ফোন নাম্বার"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy/40"
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : null}
          {loading ? "চেক করা হচ্ছে..." : "স্ট্যাটাস দেখুন"}
        </button>
      </form>

      {error && <p className="text-red-600 text-center mt-4">{error}</p>}

      {registrations && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-500 text-center">
            {registrations.length} টি রেজিস্ট্রেশন পাওয়া গেছে
          </p>
          {registrations.map((reg, i) => {
            const statusInfo = STATUS_MAP[reg.paymentStatus];
            const StatusIcon = statusInfo?.Icon ?? XCircle;
            return (
              <motion.div
                key={reg.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl shadow-lg p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-navy">
                      {reg.serviceType === "mcq" ? "এমসিকিউ পরীক্ষা ব্যাচ" : "রেগুলার কোর্স"} • {reg.department || "—"}
                    </h3>
                    <p className="text-xs text-gray-400">{formatDate(reg.createdAt)}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusInfo?.color ?? "text-gray-500 bg-gray-50"}`}>
                    <StatusIcon size={14} />
                    {statusInfo?.label ?? reg.paymentStatus}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
                  <dt className="text-gray-400">আই.এইচ.টি</dt>
                  <dd className="text-gray-700 text-right">{reg.ihtName || "—"}</dd>

                  <dt className="text-gray-400">সেশন</dt>
                  <dd className="text-gray-700 text-right">{reg.session || "—"}</dd>

                  <dt className="text-gray-400">পরিশোধযোগ্য</dt>
                  <dd className="text-gray-700 text-right">৳{reg.payableAmount}</dd>

                  <dt className="text-gray-400">পরিশোধিত</dt>
                  <dd className={`text-right font-semibold ${reg.paidAmount >= reg.payableAmount && reg.paidAmount > 0 ? "text-green-600" : "text-amber-600"}`}>
                    ৳{reg.paidAmount}
                  </dd>

                  <dt className="text-gray-400">Trnx ID</dt>
                  <dd className="text-gray-700 text-right break-all">{reg.trnxId || "—"}</dd>

                  <dt className="text-gray-400">অনুমোদন</dt>
                  <dd className="text-gray-700 text-right">
                    {reg.status === "Approved" ? "✅ Approved" : reg.status}
                  </dd>
                </dl>

                {reg.comments && (
                  <p className="text-xs text-gray-400 mt-3 border-t pt-2">{reg.comments}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}