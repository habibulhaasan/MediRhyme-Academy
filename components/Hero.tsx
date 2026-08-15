"use client";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative pt-40 pb-24 px-6 text-center bg-course-gradient overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 max-w-3xl mx-auto text-white"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-4 font-poppins drop-shadow">
          আপনার স্বপ্নের চাকরি এখন হাতের নাগালে!
        </h2>
        <p className="text-lg md:text-xl mb-8 text-white/90">
          সঠিক দিকনির্দেশনায় প্রস্তুতি নিন <b>Medi Rhyme Academy</b>-এর সাথে
        </p>
        <a href="#registration" className="btn-primary">এখনই ভর্তি হোন</a>
      </motion.div>
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_35%)]" />
    </section>
  );
}
