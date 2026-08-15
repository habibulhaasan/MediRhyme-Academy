"use client";
import { motion } from "framer-motion";
import {
  BookOpen, Presentation, ClipboardList, Laptop, CalendarDays, BarChart3, PenLine, FileText,
} from "lucide-react";

const ITEMS = [
  { icon: BookOpen, title: "পূর্ণাঙ্গ সিলেবাস", desc: "নিয়োগবিধির তফসিল ৩ অনুযায়ী ক্লাস" },
  { icon: Presentation, title: "অভিজ্ঞ শিক্ষকমণ্ডলী", desc: "প্র্যাক্টিক্যাল অভিজ্ঞতা সম্পন্ন শিক্ষকেরা ক্লাস নেবেন" },
  { icon: ClipboardList, title: "মডেল টেস্ট", desc: "প্রতি সপ্তাহে ২-৩ টি মডেল টেস্ট" },
  { icon: Laptop, title: "অনলাইন ক্লাস", desc: "Google Meet ও Google Classroom-এ ক্লাস" },
  { icon: CalendarDays, title: "সপ্তাহে ৪-৬ টি ক্লাস", desc: "সাপ্তাহিক নিয়মিত ক্লাস অনুষ্ঠিত হবে" },
  { icon: BarChart3, title: "বিগত বছরের প্রশ্ন বিশ্লেষণ", desc: "বিগত বছরের ম্যাক্সিমাম প্রশ্নের বিশ্লেষণ" },
  { icon: PenLine, title: "হোমওয়ার্ক ও রিভিশন সাপোর্ট", desc: "প্রতি ক্লাস শেষে হোমওয়ার্ক ও রিভিশন সহায়তা" },
  { icon: FileText, title: "ক্লাস শিট ও সাজেশন", desc: "প্রয়োজনীয় ক্লাস শিট এবং সাজেশন প্রদান করা হবে" },
];

export default function CourseTimeline() {
  return (
    <section id="course" className="max-w-5xl mx-auto px-6 py-20">
      <h2 className="section-title">স্বাস্থ্য অধিদপ্তরের আসন্ন নিয়োগ পরীক্ষার জন্য বিশেষ প্রস্তুতি ব্যাচ</h2>
      <p className="text-center text-gray-600 mb-14">
        ফার্মাসিস্ট ও মেডিকেল টেকনোলজিস্ট পদে চাকরির জন্য সাজানো <b>৪ মাসের প্রাইভেট ব্যাচ</b>
      </p>

      <div className="relative border-l-2 border-navy/20 md:border-l-0 md:border-none">
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-navy/15 -translate-x-1/2" />
        <div className="space-y-8 md:space-y-10">
          {ITEMS.map((item, i) => {
            const Icon = item.icon;
            const rightSide = i % 2 === 1;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: rightSide ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5 }}
                className={`md:flex md:items-center ${rightSide ? "md:justify-end" : "md:justify-start"}`}
              >
                <div className={`ml-8 md:ml-0 md:w-[46%] bg-white rounded-xl shadow-md p-5 card-hover ${rightSide ? "md:text-left" : "md:text-right"}`}>
                  <Icon className={`text-navy mb-2 ${rightSide ? "" : "md:ml-auto"}`} size={28} />
                  <h3 className="font-bold text-navy mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
