"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function SeminarForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/seminar-register", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
      setDone(true);
      form.reset();
      toast.success("রেজিস্ট্রেশন সম্পন্ন হয়েছে!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <h3 className="text-xl font-bold text-navy mb-2">✅ ধন্যবাদ!</h3>
        <p className="text-gray-600">সেমিনারের লিংক ইমেইলে পাঠানো হবে। অনুগ্রহ করে নির্ধারিত সময়ে যোগ দিন।</p>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-5"
    >
      <Field label="নাম" name="name" required />
      <Field label="ইমেইল" name="email" type="email" required />
      <Field label="ফোন" name="phone" type="tel" required />
      <Field label="বর্তমান ঠিকানা" name="address" />
      <Field label="আই.এইচ.টির নাম" name="ihtName" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="সেশন" name="session" placeholder="যেমন: 2017-18" />
        <Field label="পাশের সাল" name="passingYear" placeholder="যেমন: 2023" />
      </div>
      <Field label="বিভাগ" name="department" />
      <Field label="মন্তব্য (ঐচ্ছিক)" name="comments" />
      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
        {loading && <Loader2 className="animate-spin" size={18} />}
        {loading ? "জমা দেওয়া হচ্ছে..." : "সেমিনারে নিবন্ধন করুন"}
      </button>
    </motion.form>
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
