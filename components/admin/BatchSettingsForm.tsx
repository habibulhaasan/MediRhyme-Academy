"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { Layers, Loader2 } from "lucide-react";

export default function BatchSettingsForm() {
  const [currentBatch, setCurrentBatch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "batch"));
        if (snap.exists()) setCurrentBatch((snap.data() as { currentBatch?: string }).currentBatch || "");
      } catch (err) {
        toast.error("ব্যাচ সেটিংস লোড করতে সমস্যা হয়েছে");
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
      await setDoc(doc(db, "settings", "batch"), { currentBatch }, { merge: true });
      toast.success("Current batch saved");
    } catch (err) {
      toast.error("Save failed — check you're logged in and Firestore rules are deployed");
      console.error(err);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-5 flex items-center gap-2 text-gray-500">
        <Loader2 className="animate-spin" size={18} /> Loading...
      </div>
    );
  }

  return (
    <form onSubmit={save} className="bg-white rounded-xl shadow p-5 space-y-3">
      <h2 className="font-bold text-navy flex items-center gap-2 mb-1">
        <Layers size={18} /> Current Batch
      </h2>
      <p className="text-xs text-gray-400 mb-2">
        Every new registration (course or MCQ) silently records this batch — students never see it.
      </p>
      <input
        placeholder="e.g. Batch 12"
        value={currentBatch}
        onChange={(e) => setCurrentBatch(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
      />
      <button disabled={saving} className="btn-primary text-sm">
        {saving ? "Saving..." : "Save Batch"}
      </button>
    </form>
  );
}