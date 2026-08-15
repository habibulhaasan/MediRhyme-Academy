import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { handleApiError } from "@/lib/apiError";

// Public endpoint — a student proves ownership of a record by knowing both
// the email AND phone they registered with. Only a safe subset of fields
// is returned, never the raw Firestore document.
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email")?.trim();
    const phone = req.nextUrl.searchParams.get("phone")?.trim();

    if (!email || !phone) {
      return NextResponse.json(
        { success: false, error: "ইমেইল ও ফোন নাম্বার দিন" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const snap = await db
      .collection("students")
      .where("email", "==", email)
      .where("phone", "==", phone)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json(
        { success: false, error: "এই তথ্য দিয়ে কোনো রেজিস্ট্রেশন পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    const data = snap.docs[0].data();

    return NextResponse.json({
      success: true,
      name: data.name ?? "",
      status: data.status ?? "Pending",
      paymentStatus: data.paymentStatus ?? "awaiting-gateway",
      paymentAmount: data.paymentAmount ?? 0,
      department: data.department ?? "",
      session: data.session ?? "",
    });
  } catch (err) {
    return handleApiError(err);
  }
}