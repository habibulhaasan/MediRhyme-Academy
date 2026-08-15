"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { Wallet, Loader2, Eye, EyeOff } from "lucide-react";

interface FeesState {
  courseFee: string; deadline: string; discountPercent: string; offeredAmount: string; paymentNo: string;
  mcqCourseFee: string; mcqDeadline: string; mcqDiscountPercent: string; mcqOfferedAmount: string; mcqPaymentNo: string;
  mcqCardVisible: boolean;
}

const EMPTY: FeesState = {
  courseFee: "", deadline: "", discountPercent: "", offeredAmount: "", paymentNo: "",
  mcqCourseFee: "", mcqDeadline: "", mcqDiscountPercent: "", mcqOfferedAmount: "", mcqPaymentNo: "",
  mcqCardVisible: true,
};

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30";

/** discountPercent -> offeredAmount, given a course fee. Empty/zero fee is left alone. */
function amountFromPercent(courseFee: string, percent: string): string {
  const fee = Number(courseFee);
  const pct = Number(percent);
  if (!fee || Number.isNaN(pct)) return "";
  return Math.round(fee - (fee * pct) / 100).toString();
}

/** offeredAmount -> discountPercent, given a course fee. */
function percentFromAmount(courseFee: string, amount: string): string {
  const fee = Number(courseFee);
  const amt = Number(amount);
  if (!fee || Number.isNaN(amt)) return "";
  return (Math.round(((fee - amt) / fee) * 1000) / 10).toString(); // 1 decimal place
}

export default function FeesSettingsForm() {
  const [fees, setFees] = useState<FeesState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "fees"));
        if (snap.exists()) setFees((f) => ({ ...f, ...(snap.data() as Partial<FeesState>) }));
      } catch (err) {
        toast.error("ফি সেটিংস লোড করতে সমস্যা হয়েছে");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "fees"), fees, { merge: true });
      toast.success("Fees settings saved");
    } catch (err) {
      toast.error("Save failed — check you're logged in and Firestore rules are deployed");
      console.error(err);
    }
    setSaving(false);
  }

  function updateCourseFee(prefix: "" | "mcq", value: string) {
    if (prefix === "") {
      // Recompute offeredAmount from the existing discount % against the new fee.
      const offeredAmount = fees.discountPercent ? amountFromPercent(value, fees.discountPercent) : fees.offeredAmount;
      setFees((f) => ({ ...f, courseFee: value, offeredAmount }));
    } else {
      const mcqOfferedAmount = fees.mcqDiscountPercent ? amountFromPercent(value, fees.mcqDiscountPercent) : fees.mcqOfferedAmount;
      setFees((f) => ({ ...f, mcqCourseFee: value, mcqOfferedAmount }));
    }
  }

  function updateDiscountPercent(prefix: "" | "mcq", value: string) {
    if (prefix === "") {
      setFees((f) => ({ ...f, discountPercent: value, offeredAmount: amountFromPercent(f.courseFee, value) }));
    } else {
      setFees((f) => ({ ...f, mcqDiscountPercent: value, mcqOfferedAmount: amountFromPercent(f.mcqCourseFee, value) }));
    }
  }

  function updateOfferedAmount(prefix: "" | "mcq", value: string) {
    if (prefix === "") {
      setFees((f) => ({ ...f, offeredAmount: value, discountPercent: percentFromAmount(f.courseFee, value) }));
    } else {
      setFees((f) => ({ ...f, mcqOfferedAmount: value, mcqDiscountPercent: percentFromAmount(f.mcqCourseFee, value) }));
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-5 flex items-center gap-2 text-gray-500">
        <Loader2 className="animate-spin" size={18} /> Loading fees settings...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-xl shadow p-5 space-y-6">
      <h2 className="font-bold text-navy flex items-center gap-2"><Wallet size={18} /> Fees Settings (homepage cards)</h2>

      <FeeBlock
        title="Regular Batch"
        courseFee={fees.courseFee}
        deadline={fees.deadline}
        discountPercent={fees.discountPercent}
        offeredAmount={fees.offeredAmount}
        paymentNo={fees.paymentNo}
        onCourseFeeChange={(v) => updateCourseFee("", v)}
        onDeadlineChange={(v) => setFees((f) => ({ ...f, deadline: v }))}
        onDiscountPercentChange={(v) => updateDiscountPercent("", v)}
        onOfferedAmountChange={(v) => updateOfferedAmount("", v)}
        onPaymentNoChange={(v) => setFees((f) => ({ ...f, paymentNo: v }))}
      />

      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-navy">MCQ EXAM Batch</h3>
          <button
            type="button"
            onClick={() => setFees((f) => ({ ...f, mcqCardVisible: !f.mcqCardVisible }))}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
              fees.mcqCardVisible !== false ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
            }`}
          >
            {fees.mcqCardVisible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
            {fees.mcqCardVisible !== false ? "হোমপেজে দেখানো হচ্ছে" : "লুকানো আছে"}
          </button>
        </div>

        <FeeBlock
          title=""
          courseFee={fees.mcqCourseFee}
          deadline={fees.mcqDeadline}
          discountPercent={fees.mcqDiscountPercent}
          offeredAmount={fees.mcqOfferedAmount}
          paymentNo={fees.mcqPaymentNo}
          onCourseFeeChange={(v) => updateCourseFee("mcq", v)}
          onDeadlineChange={(v) => setFees((f) => ({ ...f, mcqDeadline: v }))}
          onDiscountPercentChange={(v) => updateDiscountPercent("mcq", v)}
          onOfferedAmountChange={(v) => updateOfferedAmount("mcq", v)}
          onPaymentNoChange={(v) => setFees((f) => ({ ...f, mcqPaymentNo: v }))}
        />
      </div>

      <button disabled={saving} className="btn-primary text-sm">{saving ? "Saving..." : "Save Fees"}</button>
    </form>
  );
}

interface FeeBlockProps {
  title: string;
  courseFee: string;
  deadline: string;
  discountPercent: string;
  offeredAmount: string;
  paymentNo: string;
  onCourseFeeChange: (v: string) => void;
  onDeadlineChange: (v: string) => void;
  onDiscountPercentChange: (v: string) => void;
  onOfferedAmountChange: (v: string) => void;
  onPaymentNoChange: (v: string) => void;
}

function FeeBlock({
  title, courseFee, deadline, discountPercent, offeredAmount, paymentNo,
  onCourseFeeChange, onDeadlineChange, onDiscountPercentChange, onOfferedAmountChange, onPaymentNoChange,
}: FeeBlockProps) {
  return (
    <div className="space-y-3">
      {title && <h3 className="font-semibold text-navy">{title}</h3>}

      <div>
        <label className="block text-xs text-gray-500 mb-1">মূল কোর্স ফি (৳)</label>
        <input type="number" min={0} value={courseFee} onChange={(e) => onCourseFeeChange(e.target.value)} className={inputCls} />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">ছাড়ের ডেডলাইন</label>
        <input type="date" value={deadline} onChange={(e) => onDeadlineChange(e.target.value)} className={inputCls} />
        <p className="text-[11px] text-gray-400 mt-1">খালি রাখলে হোমপেজে &quot;শীঘ্রই ঘোষণা হবে&quot; দেখাবে।</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">ছাড় (%)</label>
          <input type="number" min={0} max={100} step="0.1" value={discountPercent}
            onChange={(e) => onDiscountPercentChange(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">ছাড়ের পর ফি (৳)</label>
          <input type="number" min={0} value={offeredAmount}
            onChange={(e) => onOfferedAmountChange(e.target.value)} className={inputCls} />
        </div>
      </div>
      <p className="text-[11px] text-gray-400 -mt-2">যেকোনো একটি (% বা টাকা) লিখলে অন্যটি স্বয়ংক্রিয়ভাবে হিসাব হয়ে যাবে।</p>

      <div>
        <label className="block text-xs text-gray-500 mb-1">পেমেন্ট নাম্বার</label>
        <input value={paymentNo} onChange={(e) => onPaymentNoChange(e.target.value)} className={inputCls} />
      </div>
    </div>
  );
}