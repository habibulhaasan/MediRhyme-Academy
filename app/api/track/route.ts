import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { handleApiError } from "@/lib/apiError";

// Public endpoint — a student proves ownership of records by knowing both
// the email AND phone they registered with. Returns EVERY matching
// registration (a student may have submitted more than once), newest first,
// with only the fields relevant to tracking payment status.
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
      .orderBy("createdAt", "desc")
      .get();

    if (snap.empty) {
      return NextResponse.json(
        { success: false, error: "এই তথ্য দিয়ে কোনো রেজিস্ট্রেশন পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    const registrations = snap.docs.map((doc) => {
      const data = doc.data();
      // Firestore Admin SDK returns a Timestamp object for serverTimestamp()
      // fields — convert to ISO strings so the client can format them.
      const createdAt = data.createdAt?.toDate
        ? data.createdAt.toDate().toISOString()
        : null;

      return {
        id: doc.id,
        name: data.name ?? "",
        status: data.status ?? "Pending",
        paymentStatus: data.paymentStatus ?? "awaiting-gateway",
        serviceType: data.serviceType === "mcq" ? "mcq" : "course",
        // payableAmount = what's owed; paidAmount = what's actually been
        // received (falls back to the old merged `paymentAmount` field for
        // records created before this split existed).
        payableAmount: data.payableAmount ?? data.paymentAmount ?? 0,
        paidAmount: data.paidAmount ?? 0,
        trnxId: data.trnxId ?? "",
        department: data.department ?? "",
        session: data.session ?? "",
        ihtName: data.ihtName ?? "",
        comments: data.comments ?? "",
        createdAt,
        approvedAt: data.approvedAt ?? null,
      };
    });

    return NextResponse.json({ success: true, registrations });
  } catch (err) {
    return handleApiError(err);
  }
}