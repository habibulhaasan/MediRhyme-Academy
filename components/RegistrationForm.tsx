"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2, CheckCircle2 } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import LocationSelect, { type LocationValue } from "./LocationSelect";
import IhtSelect from "./IhtSelect";
import { NON_GOVT_IHT_VALUE } from "@/lib/ihtList";
import { resolveAddress } from "@/lib/location/location-data";
import { EMPTY_FEES, resolveFee, type FeesSettings } from "@/lib/fees";

const DEPARTMENTS = ["Pharmacy", "Laboratory", "Radiology", "Physiotherapy", "Radiotherapy", "Dental"];
const EMPTY_LOCATION: LocationValue = { divisionId: "", districtId: "", upazilaId: "", addressDetail: "" };

type ServiceType = "course" | "mcq";

export default function RegistrationForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION);
  const [ihtSelected, setIhtSelected] = useState("");
  const [ihtManual, setIhtManual] = useState("");

  const [fees, setFees] = useState<FeesSettings>(EMPTY_FEES);
  const [feesLoading, setFeesLoading] = useState(true);
  const [serviceType, setServiceType] = useState<ServiceType>("course");
  const [batch, setBatch] = useState(""); // fetched silently, never shown to the student

  useEffect(() => {
    (async () => {
      try {
        const [feesSnap, batchSnap] = await Promise.all([
          getDoc(doc(db, "settings", "fees")),
          getDoc(doc(db, "settings", "batch")),
        ]);
        if (feesSnap.exists()) {
          setFees((f) => ({ ...f, ...(feesSnap.data() as Partial<FeesSettings>) }));
        }
        if (batchSnap.exists()) {
          setBatch((batchSnap.data() as { currentBatch?: string }).currentBatch || "");
        }
      } catch (err) {
        console.error("Failed to load fee/batch settings:", err);
      } finally {
        setFeesLoading(false);
      }
    })();
  }, []);

  const payableAmount =
    serviceType === "mcq"
      ? resolveFee(fees.mcqCourseFee, fees.mcqOfferedAmount, fees.mcqDeadline)
      : resolveFee(fees.courseFee, fees.offeredAmount, fees.deadline);

  const paymentNo = serviceType === "mcq" ? fees.mcqPaymentNo : fees.paymentNo;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    const ihtName = ihtSelected === NON_GOVT_IHT_VALUE ? ihtManual.trim() : ihtSelected;
    if (!ihtName) {
      toast.error("অনুগ্রহ করে আই.এইচ.টির নাম দিন");
      setLoading(false);
      return;
    }

    const resolvedAddress = resolveAddress(location.divisionId, location.districtId, location.upazilaId, "bn");

    const payload = {
      ...data,
      ihtName,
      address: `${location.addressDetail}, ${resolvedAddress.label}`.replace(/^,\s*/, ""),
      addressDetail: location.addressDetail,
      divisionId: location.divisionId,
      districtId: location.districtId,
      upazilaId: location.upazilaId,
      serviceType,
      payableAmount,
      batch, // silent — not shown in the UI, just carried along for admin
    };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
      }

      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }

      setSuccess(true);
      form.reset();
      setLocation(EMPTY_LOCATION);
      setIhtSelected("");
      setIhtManual("");
      setServiceType("course");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="registration" className="max-w-2xl mx-auto px-6 py-20">
      <h2 className="section-title mb-10">রেজিস্ট্রেশন ফর্ম</h2>

      <motion.form
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-5"
      >
        <Field label="নাম" name="name" placeholder="সার্টিফিকেট অনুসারে নাম লিখুন" required />
        <Field label="ইমেইল" name="email" type="email" placeholder="সঠিক Gmail লিখুন" required />
        <Field label="ফোন" name="phone" type="tel" placeholder="মোবাইল নাম্বার দিন" required />

        <LocationSelect value={location} onChange={setLocation} required />

        <IhtSelect
          selected={ihtSelected}
          manualName={ihtManual}
          onSelectedChange={setIhtSelected}
          onManualNameChange={setIhtManual}
          required
        />

        <div>
          <label className="block text-sm font-semibold text-navy mb-1">ডিপার্টমেন্ট</label>
          <select name="department" required defaultValue="" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy/40">
            <option value="" disabled>ডিপার্টমেন্ট নির্বাচন করুন</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="সেশন" name="session" placeholder="যেমন: 2017-18" required />
          <Field label="পাশের সাল" name="passingYear" pattern="[0-9]{4}" placeholder="যেমন: 2023" required />
        </div>

        {/* Only shown when the MCQ Exam batch is currently open (settings/fees.mcqCardVisible) */}
        {!feesLoading && fees.mcqCardVisible && (
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">কোন ব্যাচের জন্য আবেদন করছেন</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value as ServiceType)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy/40"
            >
              <option value="course">রেগুলার কোর্স ব্যাচ</option>
              <option value="mcq">এমসিকিউ পরীক্ষা ব্যাচ</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-navy mb-1">পরিশোধযোগ্য পরিমাণ (৳)</label>
          <input
            readOnly
            value={feesLoading ? "লোড হচ্ছে..." : `৳${payableAmount}`}
            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-gray-700 cursor-not-allowed"
          />
          {!feesLoading && paymentNo && (
            <p className="text-xs text-gray-500 mt-1.5">
              এই নাম্বারে পেমেন্ট পাঠান: <span className="font-semibold text-navy">{paymentNo}</span>
            </p>
          )}
        </div>

        <Field label="ট্রান্সেকশন আইডি" name="trnxId" placeholder="Trnx ID অথবা bKash/Nagad নাম্বার (পেমেন্ট গেটওয়ে ব্যবহার করলে ঐচ্ছিক)" />
        <TextArea label="অন্যান্য মন্তব্য (ঐচ্ছিক)" name="comments" placeholder="ব্যাচ (Regular নাকি Exam Only) তা লিখুন" />

        <button type="submit" disabled={loading || feesLoading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <Loader2 className="animate-spin" size={18} /> : null}
          {loading ? "জমা দেওয়া হচ্ছে..." : "নিবন্ধন করুন"}
        </button>
      </motion.form>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center px-4"
          >
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
              <CheckCircle2 className="mx-auto text-green-500 mb-3" size={48} />
              <h3 className="text-xl font-bold text-navy mb-2">অভিনন্দন!</h3>
              <p className="text-gray-600 mb-1">আপনার নিবন্ধন সফলভাবে সম্পন্ন হয়েছে।</p>
              <p className="text-gray-600 mb-5">পেমেন্ট ভেরিফাই হবার পর আপনাকে ইমেইল করা হবে এবং <b>Google Classroom</b> এর ইনভাইটেশন পাবেন।</p>
              <button onClick={() => setSuccess(false)} className="btn-primary">বন্ধ করুন</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <div>
      <label className="block text-sm font-semibold text-navy mb-1">{label}</label>
      <input {...rest} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy/40" />
    </div>
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <div>
      <label className="block text-sm font-semibold text-navy mb-1">{label}</label>
      <textarea {...rest} rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy/40" />
    </div>
  );
}