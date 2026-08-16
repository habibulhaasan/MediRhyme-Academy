import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { sendApprovalEmail } from "@/lib/email";
import { handleApiError } from "@/lib/apiError";

const ALLOWED_COLLECTIONS = ["students", "seminar_registrations", "mcq_registrations"];

export async function POST(req: NextRequest) {
  try {
    // 1. Verify the caller is signed in with Firebase Auth.
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifyIdToken(token);

    // 2. Optionally restrict to a specific set of admin emails via env var,
    // e.g. ADMIN_EMAILS=you@gmail.com,colleague@gmail.com
    // If ADMIN_EMAILS is unset, any signed-in Firebase user is treated as admin —
    // set this once you have real admin accounts.
    const allowList = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (allowList.length > 0) {
      if (!decoded.email || !allowList.includes(decoded.email.toLowerCase())) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
    }

    // 3. Validate input.
    const { collection, id } = await req.json();
    if (!collection || !id || !ALLOWED_COLLECTIONS.includes(collection)) {
      return NextResponse.json({ success: false, error: "Invalid collection or id" }, { status: 400 });
    }

    const db = getAdminDb();
    const ref = db.collection(collection).doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    const data = snap.data()!;

    // If paidAmount hasn't been set yet, default it to the payable amount —
    // approving implies the payment is confirmed in full. Admin can still
    // hand-adjust it afterward (partial payment, extra discount, etc).
    // Falls back to the old `paymentAmount` field name for records created
    // before the payable/paid split existed.
    const payable = data.payableAmount ?? data.paymentAmount ?? 0;
    const paidAmountUpdate =
      collection === "students" && !data.paidAmount ? { paidAmount: payable } : {};

    // 4. Mark approved.
    await ref.update({
      status: "Approved",
      ...(collection === "students" ? { paymentStatus: "verified" } : {}),
      ...paidAmountUpdate,
      approvedAt: new Date().toISOString(),
      approvedBy: decoded.email ?? decoded.uid,
    });

    // 5. Email the student. If this fails, the approval itself has already
    // succeeded — report it separately rather than rolling back.
    let emailSent = false;
    let emailError: string | null = null;
    if (data.email) {
      try {
        await sendApprovalEmail(data.email, data.name || "");
        emailSent = true;
      } catch (emailErr) {
        emailError = emailErr instanceof Error ? emailErr.message : String(emailErr);
        console.error("Approval email failed:", emailError);
      }
    } else {
      emailError = "No email address on this registration";
    }

    return NextResponse.json({ success: true, emailSent, emailError });
  } catch (err) {
    return handleApiError(err);
  }
}