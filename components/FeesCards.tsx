"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface FeesSettings {
  courseFee?: string; deadline?: string; discountPercent?: string; offeredAmount?: string; paymentNo?: string;
  mcqCourseFee?: string; mcqDeadline?: string; mcqDiscountPercent?: string; mcqOfferedAmount?: string; mcqPaymentNo?: string;
}

const DEFAULTS: FeesSettings = {
  courseFee: "5000", deadline: "শীঘ্রই ঘোষণা হবে", discountPercent: "20", offeredAmount: "4000", paymentNo: "01744876993 (bKash/Nagad)",
  mcqCourseFee: "1500", mcqDeadline: "শীঘ্রই ঘোষণা হবে", mcqDiscountPercent: "15", mcqOfferedAmount: "1275", mcqPaymentNo: "01744876993 (bKash/Nagad)",
};

export default function FeesCards() {
  const [fees, setFees] = useState<FeesSettings>(DEFAULTS);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "fees"), (snap) => {
      if (snap.exists()) setFees({ ...DEFAULTS, ...(snap.data() as FeesSettings) });
    });
    return () => unsub();
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap justify-center gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="flex-1 min-w-[280px] max-w-[440px] bg-course-gradient text-white rounded-2xl p-8 text-center shadow-xl card-hover"
      >
        <h2 className="text-2xl font-bold mb-4 font-poppins">Regular Batch<br />কোর্স ফি মাত্র {fees.courseFee}/-</h2>
        <p className="mb-4">আগামী <b>{fees.deadline}</b> এর মধ্যে ভর্তি হলে</p>
        <span className="inline-block bg-black/30 rounded-lg px-4 py-2 text-xl font-bold mb-4">
          {fees.discountPercent}% ছাড়ে মাত্র {fees.offeredAmount}/-
        </span>
        <p className="bg-white/10 rounded-lg py-2 px-3 font-medium">টাকা পাঠানঃ <b>{fees.paymentNo}</b></p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
        className="flex-1 min-w-[280px] max-w-[440px] bg-mcq-gradient text-white rounded-2xl p-8 text-center shadow-xl card-hover"
      >
        <h2 className="text-2xl font-bold mb-4 font-poppins">MCQ EXAM Batch<br />ফি মাত্র {fees.mcqCourseFee}/-</h2>
        <p className="mb-4">আগামী <b>{fees.mcqDeadline}</b> এর মধ্যে ভর্তি হলে</p>
        <span className="inline-block bg-black/30 rounded-lg px-4 py-2 text-xl font-bold mb-4">
          {fees.mcqDiscountPercent}% ছাড়ে মাত্র {fees.mcqOfferedAmount}/-
        </span>
        <p className="bg-white/10 rounded-lg py-2 px-3 font-medium">টাকা পাঠানঃ <b>{fees.mcqPaymentNo}</b></p>
      </motion.div>
    </section>
  );
}
