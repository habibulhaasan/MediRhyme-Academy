"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";

type TrackResult = {
  name: string;
  status: string;
  paymentStatus: string;
  paymentAmount: number;
  department: string;
  session: string;
};

const STATUS_MAP: Record<string, { label: string; color: string; Icon: typeof CheckCircle2 }> = {
  verified: { label: "ভেরিফাইড ✅", color: "text-green-600", Icon: CheckCircle2 },
  "manual-submitted": { label: "পর্যালোচনাধীন ⏳", color: "text-amber-600", Icon: Clock },
  "awaiting-gateway": { label: "পেমেন্টের অপেক্ষায়", color: "text-gray-500", Icon: Clock },
};

export default function TrackPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(
        `/api/track?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "পাওয়া যায়নি");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "কিছু একটা সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  const statusInfo = result ? STATUS_MAP[result.paymentStatus] : null;
  const StatusIcon = statusInfo?.Icon ?? XCircle;

  return (
    <section className="max-w-md mx-auto px-6 py-20">
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

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mt-4 text-center"
        >
          <h3 className="font-bold text-navy mb-2">{result.name}</h3>
          <div className={`flex items-center justify-center gap-2 font-semibold ${statusInfo?.color ?? "text-gray-500"}`}>
            <StatusIcon size={20} />
            {statusInfo?.label ?? result.paymentStatus}
          </div>
          <p className="text-gray-600 text-sm mt-2">
            {result.department} • {result.session} • ৳{result.paymentAmount}
          </p>
        </motion.div>
      )}
    </section>
  );
}