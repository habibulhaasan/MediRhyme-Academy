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
      ihtName, department, session, passingYear, paymentAmount, trnxId, comments,
    } = body;

    if (!name || !email || !phone || !department) {
      return NextResponse.json({ success: false, error: "প্রয়োজনীয় তথ্য অনুপস্থিত" }, { status: 400 });
    }

    const docRef = await getAdminDb().collection("students").add({
      name, email, phone,
      address: address || "",
      addressDetail: addressDetail || "",
      divisionId: divisionId || "",
      districtId: districtId || "",
      upazilaId: upazilaId || "",
      ihtName, department, session, passingYear,
      paymentAmount: Number(paymentAmount) || 0,
      trnxId: trnxId || "",
      comments: comments || "",
      status: "Pending",
      paidAmount: 0,
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
        amount: Number(paymentAmount) || 0,
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
