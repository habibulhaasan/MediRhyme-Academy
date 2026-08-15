import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-course-gradient">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md text-center">
        <CheckCircle2 className="mx-auto text-green-500 mb-4" size={56} />
        <h1 className="text-2xl font-bold text-navy mb-2 font-poppins">পেমেন্ট সম্পন্ন হয়েছে!</h1>
        <p className="text-gray-600 mb-6">
          আপনার পেমেন্ট PipraPay দিয়ে ভেরিফাই করা হচ্ছে। ভেরিফিকেশন সম্পন্ন হলে ইমেইলে জানানো হবে
          এবং Google Classroom ইনভাইটেশন পাঠানো হবে।
        </p>
        <Link href="/" className="btn-primary">হোমে ফিরে যান</Link>
      </div>
    </div>
  );
}
