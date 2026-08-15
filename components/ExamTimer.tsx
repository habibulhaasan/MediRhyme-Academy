"use client";
import { useEffect, useRef, useState } from "react";
import { Hourglass, Lock } from "lucide-react";

interface ExamTimerProps {
  formUrl: string;
  isOpen: boolean;
  durationMinutes?: number;
  storageKey?: string;
}

export default function ExamTimer({ formUrl, isOpen, durationMinutes = 60, storageKey = "examStartTime" }: ExamTimerProps) {
  const durationMs = durationMinutes * 60 * 1000;
  const [remaining, setRemaining] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!isOpen || started.current) return;
    started.current = true;

    let startTime = Number(localStorage.getItem(storageKey));
    if (!startTime) {
      startTime = Date.now();
      localStorage.setItem(storageKey, String(startTime));
    }

    const tick = () => {
      const left = durationMs - (Date.now() - startTime);
      if (left <= 0) {
        setRemaining(0);
        setTimedOut(true);
        localStorage.removeItem(storageKey);
        clearInterval(interval);
      } else {
        setRemaining(left);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isOpen, durationMs, storageKey]);

  if (!isOpen) {
    return (
      <div className="flex flex-col items-center justify-center text-center bg-white rounded-2xl shadow-lg p-12">
        <Lock className="text-navy mb-4" size={44} />
        <h3 className="text-xl font-bold text-navy mb-2">পরীক্ষা বন্ধ আছে (Exam Closed)</h3>
        <p className="text-gray-600">দুঃখিত, এই মডেল টেস্টের উত্তরপত্র গ্রহণের সময়সীমা শেষ হয়ে গেছে।</p>
      </div>
    );
  }

  const minutes = remaining !== null ? Math.floor(remaining / 60000) : durationMinutes;
  const seconds = remaining !== null ? Math.floor((remaining % 60000) / 1000) : 0;

  return (
    <div>
      {!timedOut && (
        <div className="fixed top-20 right-4 z-50 bg-navy text-white rounded-xl px-4 py-2 text-center shadow-lg">
          <p className="text-xs">সময় বাকি আছে:</p>
          <span className="text-lg font-bold tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      )}

      {timedOut ? (
        <div className="flex flex-col items-center justify-center text-center bg-white rounded-2xl shadow-lg p-12">
          <Hourglass className="text-red-500 mb-4" size={44} />
          <h3 className="text-xl font-bold text-navy mb-2">সময় শেষ! (Time Out!)</h3>
          <p className="text-gray-600">পরীক্ষার নির্ধারিত সময় শেষ হয়ে গেছে। এখন আর কোনো উত্তর জমা দেওয়া যাবে না।</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <iframe src={formUrl} className="w-full min-h-[85vh]" title="MCQ Exam Form">Loading…</iframe>
        </div>
      )}
    </div>
  );
}
