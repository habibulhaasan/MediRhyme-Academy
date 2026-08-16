import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { createCharge } from "@/lib/piprapay";
import { handleApiError } from "@/lib/apiError";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, email, phone, address, addressDetail, divisionId, districtId, upazilaId,
      ihtName, department, session, passingYear, trnxId, comments,
      serviceType, payableAmount, batch,
    } = body;

    if (!name || !email || !phone || !department) {
      return NextResponse.json({ success: false, error: "প্রয়োজনীয় তথ্য অনুপস্থিত" }, { status: 400 });
    }

    const resolvedServiceType = serviceType === "mcq" ? "mcq" : "course";
    const resolvedPayableAmount = Number(payableAmount) || 0;

    const docRef = await getAdminDb().collection("students").add({
      name, email, phone,
      address: address || "",
      addressDetail: addressDetail || "",
      divisionId: divisionId || "",
      districtId: districtId || "",
      upazilaId: upazilaId || "",
      ihtName, department, session, passingYear,
      serviceType: resolvedServiceType,
      // payableAmount = what's owed (computed client-side from admin fee
      // settings; trusted here since it's not security-sensitive money-movement,
      // just a record — the actual payment is verified manually or via gateway).
      // paidAmount = what's actually been received; admin edits this,
      // and it's auto-filled to payableAmount when the registration is approved.
      payableAmount: resolvedPayableAmount,
      paidAmount: 0,
      batch: batch || "", // admin-only — never shown to the student
      trnxId: trnxId || "",
      comments: comments || "",
      status: "Pending",
      paymentStatus: trnxId ? "manual-submitted" : "awaiting-gateway",
      createdAt: FieldValue.serverTimestamp(),
    });

    // If the student didn't paste a manual bKash/Nagad trxId, send them
    // through PipraPay to pay & auto-verify instead.
    if (!trnxId && process.env.PIPRAPAY_BASE_URL && process.env.PIPRAPAY_API_KEY) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
      const charge = await createCharge({
        fullName: name,
        email,
        amount: resolvedPayableAmount,
        redirectUrl: `${siteUrl}/payment/success?ref=${docRef.id}&type=student`,
        cancelUrl: `${siteUrl}/payment/cancel?ref=${docRef.id}`,
        webhookUrl: `${siteUrl}/api/payment/webhook`,
        metadata: { studentId: docRef.id, type: "student" },
      });

      if (charge.success && charge.paymentUrl) {
        await docRef.update({ piprapayInvoiceId: charge.invoiceId ?? null });
        return NextResponse.json({ success: true, id: docRef.id, paymentUrl: charge.paymentUrl });
      }
      // Fall through silently if PipraPay isn't reachable — registration is still saved.
    }

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err) {
    return handleApiError(err);
  }
}
