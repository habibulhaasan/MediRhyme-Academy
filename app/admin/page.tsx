"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Users, Mic2, ListChecks, Wallet } from "lucide-react";
import toast from "react-hot-toast";

function useCount(collectionName: string) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, collectionName), (snap) => setCount(snap.size));
    return () => unsub();
  }, [collectionName]);
  return count;
}

export default function AdminOverviewPage() {
  const students = useCount("students");
  const seminar = useCount("seminar_registrations");
  const mcq = useCount("mcq_registrations");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-navy font-poppins mb-5">Overview</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Users} label="Student Registrations" value={students} color="bg-course-gradient" />
          <StatCard icon={Mic2} label="Seminar Registrations" value={seminar} color="bg-mcq-gradient" />
          <StatCard icon={ListChecks} label="MCQ Registrations" value={mcq} color="bg-navy" />
        </div>
      </div>

      <SettingsEditor />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | null; color: string }) {
  return (
    <div className={`rounded-xl p-5 text-white shadow ${color}`}>
      <Icon className="mb-3 opacity-90" size={26} />
      <p className="text-3xl font-bold">{value ?? "—"}</p>
      <p className="text-sm opacity-90">{label}</p>
    </div>
  );
}

function SettingsEditor() {
  const [fees, setFees] = useState({
    courseFee: "", deadline: "", discountPercent: "", offeredAmount: "", paymentNo: "",
    mcqCourseFee: "", mcqDeadline: "", mcqDiscountPercent: "", mcqOfferedAmount: "", mcqPaymentNo: "",
  });
  const [mcqExam, setMcqExam] = useState({ formUrl: "", isOpen: false, durationMinutes: 60 });
  const [saving, setSaving] = useState(false);

  async function saveFees(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "fees"), fees, { merge: true });
      toast.success("Fees settings saved");
    } catch { toast.error("Save failed"); }
    setSaving(false);
  }

  async function saveMcqExam(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "mcqExam"), mcqExam, { merge: true });
      toast.success("MCQ exam settings saved");
    } catch { toast.error("Save failed"); }
    setSaving(false);
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={saveFees} className="bg-white rounded-xl shadow p-5 space-y-3">
        <h2 className="font-bold text-navy flex items-center gap-2 mb-2"><Wallet size={18} /> Fees Settings (homepage cards)</h2>
        {Object.keys(fees).map((k) => (
          <input key={k} placeholder={k} value={(fees as any)[k]}
            onChange={(e) => setFees((f) => ({ ...f, [k]: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        ))}
        <button disabled={saving} className="btn-primary text-sm">Save Fees</button>
      </form>

      <form onSubmit={saveMcqExam} className="bg-white rounded-xl shadow p-5 space-y-3">
        <h2 className="font-bold text-navy flex items-center gap-2 mb-2"><ListChecks size={18} /> MCQ Exam Settings</h2>
        <input placeholder="Google Form embed URL" value={mcqExam.formUrl}
          onChange={(e) => setMcqExam((f) => ({ ...f, formUrl: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input type="number" placeholder="Duration (minutes)" value={mcqExam.durationMinutes}
          onChange={(e) => setMcqExam((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={mcqExam.isOpen} onChange={(e) => setMcqExam((f) => ({ ...f, isOpen: e.target.checked }))} />
          Exam is currently open
        </label>
        <button disabled={saving} className="btn-primary text-sm">Save MCQ Settings</button>
      </form>
    </div>
  );
}
