"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Users, Mic2, ListChecks, Mic, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import FeesSettingsForm from "@/components/admin/FeesSettingsForm";

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

      <div className="grid md:grid-cols-2 gap-6 items-start">
        <FeesSettingsForm />

        <div className="space-y-6">
          <McqExamSettingsForm />
          <SeminarInfoForm />
        </div>
      </div>
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

function McqExamSettingsForm() {
  const [mcqExam, setMcqExam] = useState({ formUrl: "", isOpen: false, durationMinutes: 60 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "mcqExam"));
        if (snap.exists()) setMcqExam((f) => ({ ...f, ...snap.data() }));
      } catch (err) {
        toast.error("সেটিংস লোড করতে সমস্যা হয়েছে");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "mcqExam"), mcqExam, { merge: true });
      toast.success("MCQ exam settings saved");
    } catch (err) {
      toast.error("Save failed — check you're logged in and Firestore rules are deployed");
      console.error(err);
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="bg-white rounded-xl shadow p-5 flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={18} /> Loading...</div>;
  }

  return (
    <form onSubmit={save} className="bg-white rounded-xl shadow p-5 space-y-3">
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
      <button disabled={saving} className="btn-primary text-sm">{saving ? "Saving..." : "Save MCQ Settings"}</button>
    </form>
  );
}

function SeminarInfoForm() {
  const [seminarInfo, setSeminarInfo] = useState({ topic: "", date: "", time: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "seminar"));
        if (snap.exists()) setSeminarInfo((f) => ({ ...f, ...snap.data() }));
      } catch (err) {
        toast.error("সেটিংস লোড করতে সমস্যা হয়েছে");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "seminar"), seminarInfo, { merge: true });
      toast.success("Seminar info saved");
    } catch (err) {
      toast.error("Save failed — check you're logged in and Firestore rules are deployed");
      console.error(err);
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="bg-white rounded-xl shadow p-5 flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={18} /> Loading...</div>;
  }

  return (
    <form onSubmit={save} className="bg-white rounded-xl shadow p-5 space-y-3">
      <h2 className="font-bold text-navy flex items-center gap-2 mb-2"><Mic size={18} /> Seminar Info (seminar page)</h2>
      <input placeholder="Topic" value={seminarInfo.topic}
        onChange={(e) => setSeminarInfo((f) => ({ ...f, topic: e.target.value }))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      <input placeholder="Date" value={seminarInfo.date}
        onChange={(e) => setSeminarInfo((f) => ({ ...f, date: e.target.value }))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      <input placeholder="Time" value={seminarInfo.time}
        onChange={(e) => setSeminarInfo((f) => ({ ...f, time: e.target.value }))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      <button disabled={saving} className="btn-primary text-sm">{saving ? "Saving..." : "Save Seminar Info"}</button>
    </form>
  );
}