import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

// Loaded via plain <link> tags (like the original site) instead of
// next/font, so the build never depends on reaching fonts.googleapis.com.
export const metadata: Metadata = {
  title: "Medi Rhyme Academy - MT/Ph Job Preparation",
  description: "Medical Technologist ও Pharmacist নিয়োগ পরীক্ষার জন্য বিশেষ প্রস্তুতি প্রোগ্রাম - Medi Rhyme Academy",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600&family=Poppins:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
        {children}
      </body>
    </html>
  );
}
