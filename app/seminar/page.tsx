"use client";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SeminarForm from "@/components/SeminarForm";
import { motion } from "framer-motion";

interface SeminarInfo { topic?: string; date?: string; time?: string; }

export default function SeminarPage() {
  const [info, setInfo] = useState<SeminarInfo>({ topic: "MT/Ph নিয়োগ পরীক্ষা প্রস্তুতি", date: "শীঘ্রই ঘোষণা হবে", time: "রাত ৯:০০" });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "seminar"), (snap) => {
      if (snap.exists()) setInfo(snap.data() as SeminarInfo);
    });
    return () => unsub();
  }, []);

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-course-gradient text-white rounded-2xl p-8 mb-10 text-center shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 font-poppins">ফ্রি লাইভ সেমিনার</h1>
          <p className="text-lg font-semibold">{info.topic}</p>
          <p className="mt-2">তারিখঃ <b>{info.date}</b> &nbsp;|&nbsp; সময়ঃ <b>{info.time}</b></p>
        </motion.section>
        <SeminarForm />
      </main>
      <Footer />
    </>
  );
}
