"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IhtSelect from "@/components/IhtSelect";
import { NON_GOVT_IHT_VALUE } from "@/lib/ihtList";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function FreeMcqPage() {
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [ihtSelected, setIhtSelected] = useState("");
  const [ihtManual, setIhtManual] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const ihtName = ihtSelected === NON_GOVT_IHT_VALUE ? ihtManual.trim() : ihtSelected;

    try {
      const res = await fetch("/api/mcq-register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ihtName, examType: "free" }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
      setRegistered(true);
      form.reset();
      setIhtSelected("");
      setIhtManual("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 pt-32 pb-20">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-3 font-poppins">ফ্রি মডেল টেস্ট</h1>
          <p className="text-gray-600">সম্পূর্ণ বিনামূল্যে অংশগ্রহণ করুন আমাদের সাপ্তাহিক মডেল টেস্টে। নিচের ফর্মটি পূরণ করুন।</p>
        </motion.section>

        {registered ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h3 className="text-xl font-bold text-navy mb-3">✅ রেজিস্ট্রেশন সম্পন্ন হয়েছে!</h3>
            <p className="text-gray-600 mb-6">এখন পরীক্ষা পেজে গিয়ে অংশগ্রহণ করুন।</p>
            <Link href="/mcq-exam" className="btn-primary">পরীক্ষায় যান</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-5">
            <Field label="নাম" name="name" required />
            <Field label="ইমেইল" name="email" type="email" />
            <Field label="ফোন" name="phone" type="tel" required />
            <IhtSelect selected={ihtSelected} manualName={ihtManual} onSelectedChange={setIhtSelected} onManualNameChange={setIhtManual} />
            <Field label="ডিপার্টমেন্ট" name="department" />
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 className="animate-spin" size={18} />}
              {loading ? "জমা দেওয়া হচ্ছে..." : "রেজিস্ট্রেশন করুন"}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <div>
      <label className="block text-sm font-semibold text-navy mb-1">{label}</label>
      <input {...rest} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy/40" />
    </div>
  );
}
