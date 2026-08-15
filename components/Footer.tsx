import Image from "next/image";

export default function Footer() {
  return (
    <footer id="contact" className="bg-navy-dark text-white pt-14 pb-6 mt-16">
      <div className="max-w-6xl mx-auto grid gap-10 px-6 md:grid-cols-2">
        <div className="flex flex-col items-start gap-2">
          <Image src="/logo.png" alt="Medi Rhyme Academy Logo" width={56} height={56} className="rounded" />
          <h3 className="text-xl font-bold font-poppins">Medi Rhyme Academy</h3>
          <p className="text-white/70 text-sm">Medical Technologist &amp; Pharmacist Job Preparation</p>
        </div>
        <div>
          <h4 className="text-gold font-semibold mb-3">যোগাযোগ:</h4>
          <p className="mb-1"><b>RAYHANUL ISLAM</b> — <a className="text-gold hover:underline" href="https://wa.me/8801744876993" target="_blank">+8801744876993</a></p>
          <p><b>HABIBUL HASAN</b> — <a className="text-gold hover:underline" href="https://wa.me/8801601767234" target="_blank">+8801601767234</a></p>
        </div>
      </div>
      <p className="text-center text-white/50 text-xs mt-10">© {new Date().getFullYear()} Medi Rhyme Academy. All Rights Reserved.</p>
    </footer>
  );
}
