"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Users, Mic2, ListChecks, LogOut, Loader2 } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/seminar", label: "Seminar Registrations", icon: Mic2 },
  { href: "/admin/mcq", label: "MCQ Registrations", icon: ListChecks },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) router.push("/login");
    });
    return () => unsub();
  }, [router]);

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-navy" size={32} />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-navy text-white flex-col hidden md:flex">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded" />
          <span className="font-bold font-poppins">Admin Panel</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${pathname === href ? "bg-gold text-navy-dark font-semibold" : "hover:bg-white/10"}`}>
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
        <button onClick={() => signOut(auth)} className="flex items-center gap-3 px-5 py-4 text-sm border-t border-white/10 hover:bg-white/10">
          <LogOut size={18} /> Logout
        </button>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="md:hidden bg-navy text-white flex items-center justify-between px-4 py-3">
          <span className="font-bold font-poppins">Admin Panel</span>
          <button onClick={() => signOut(auth)}><LogOut size={20} /></button>
        </div>
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
