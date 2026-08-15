import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, address, ihtName, department, session, passingYear, comments } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ success: false, error: "প্রয়োজনীয় তথ্য অনুপস্থিত" }, { status: 400 });
    }

    const docRef = await getAdminDb().collection("seminar_registrations").add({
      name, email, phone, address, ihtName, department, session, passingYear,
      comments: comments || "",
      status: "Pending",
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "সার্ভার সমস্যা, আবার চেষ্টা করুন" }, { status: 500 });
  }
}
