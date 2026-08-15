"use client";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExamTimer from "@/components/ExamTimer";
import Link from "next/link";

interface McqSettings { formUrl?: string; isOpen?: boolean; durationMinutes?: number; }

export default function McqExamPage() {
  const [settings, setSettings] = useState<McqSettings>({ formUrl: "", isOpen: false, durationMinutes: 60 });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "mcqExam"), (snap) => {
      if (snap.exists()) setSettings(snap.data() as McqSettings);
    });
    return () => unsub();
  }, []);

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center bg-mcq-gradient text-white rounded-2xl p-6 mb-6 shadow-lg">
          <h3 className="font-bold mb-2">MCQ Exam ব্যাচে রেজিস্ট্রেশন করতে</h3>
          <Link href="/#registration" className="btn-primary !bg-white !text-navy">ক্লিক করুন</Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-2 font-poppins">MCQ পরীক্ষা</h1>
          <p className="text-gray-600">MCQ দেওয়ার জন্য <span className="text-red-500 font-semibold">{settings.durationMinutes || 60} মিনিট</span> সময় পাবেন। নির্ধারিত সময় পর ফরমটি আর পূরণ করা যাবে না।</p>
        </div>

        {settings.formUrl ? (
          <ExamTimer formUrl={settings.formUrl} isOpen={!!settings.isOpen} durationMinutes={settings.durationMinutes || 60} />
        ) : (
          <div className="text-center bg-white rounded-2xl shadow-lg p-12 text-gray-500">এই মুহূর্তে কোনো পরীক্ষা চলছে না।</div>
        )}
      </main>
      <Footer />
    </>
  );
}
