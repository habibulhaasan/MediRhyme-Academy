import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-mcq-gradient">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md text-center">
        <XCircle className="mx-auto text-red-500 mb-4" size={56} />
        <h1 className="text-2xl font-bold text-navy mb-2 font-poppins">পেমেন্ট বাতিল হয়েছে</h1>
        <p className="text-gray-600 mb-6">আপনার পেমেন্ট সম্পন্ন হয়নি। আবার চেষ্টা করুন অথবা ম্যানুয়াল bKash/Nagad নাম্বারে পাঠিয়ে Transaction ID দিয়ে রেজিস্ট্রেশন করুন।</p>
        <Link href="/#registration" className="btn-primary">আবার চেষ্টা করুন</Link>
      </div>
    </div>
  );
}
