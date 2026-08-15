import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, ihtName, department, examType } = body;

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: "প্রয়োজনীয় তথ্য অনুপস্থিত" }, { status: 400 });
    }

    const docRef = await getAdminDb().collection("mcq_registrations").add({
      name, email: email || "", phone, ihtName: ihtName || "", department: department || "",
      examType: examType || "free",
      status: "Pending",
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "সার্ভার সমস্যা, আবার চেষ্টা করুন" }, { status: 500 });
  }
}
