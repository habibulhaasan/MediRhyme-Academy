"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "/#course", label: "কোর্স" },
  { href: "/#registration", label: "ভর্তি" },
  { href: "/seminar", label: "সেমিনার" },
  { href: "/free-mcq", label: "ফ্রি মডেল টেস্ট" },
  { href: "/mcq-exam", label: "MCQ পরীক্ষা" },
  { href: "/#contact", label: "যোগাযোগ" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-[999] bg-navy text-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <Image src="/logo.png" alt="Medi Rhyme Academy Logo" width={46} height={46} className="shrink-0 rounded" />
          <div className="leading-tight">
            <h1 className="font-bold text-base md:text-xl font-poppins truncate">
              <span>Medi Rhyme Academy</span>
              <span className="mx-2 hidden sm:inline text-white/50">|</span>
              <span className="hidden sm:inline text-gold font-hind">মেডি রাইম একাডেমি</span>
            </h1>
            <span className="text-[11px] md:text-xs text-gold font-medium">for Medical Technologist &amp; Pharmacist</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-gold transition-colors">
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="border border-gold text-gold px-4 py-1.5 rounded-full hover:bg-gold hover:text-navy-dark transition-colors">
            Admin
          </Link>
        </nav>

        <button aria-label="Menu" className="md:hidden" onClick={() => setOpen((v) => !v)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-navy-dark"
          >
            <div className="flex flex-col px-4 py-3 gap-3">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-1 hover:text-gold">
                  {l.label}
                </Link>
              ))}
              <Link href="/login" onClick={() => setOpen(false)} className="py-1 text-gold">
                Admin Login
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
