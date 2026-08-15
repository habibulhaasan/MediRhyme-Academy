import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { verifyPayment } from "@/lib/piprapay";
import { handleApiError } from "@/lib/apiError";

// PipraPay calls this URL after a payment attempt (configured as `webhook_url`
// when the charge was created). The exact payload field names can differ
// between PipraPay versions/instances — check your panel's webhook log and
// adjust the field reads below (`invoiceId`, `studentId`) if needed.
export async function POST(req: NextRequest) {
  try {
    // Optional shared-secret check, if your PipraPay instance supports it.
    const secret = process.env.PIPRAPAY_WEBHOOK_SECRET;
    if (secret) {
      const provided = req.headers.get("x-piprapay-secret") || req.nextUrl.searchParams.get("secret");
      if (provided !== secret) {
        return NextResponse.json({ success: false, error: "Invalid webhook secret" }, { status: 401 });
      }
    }

    const payload = await req.json();
    const invoiceId: string | undefined = payload?.pp_id ?? payload?.invoice_id ?? payload?.invoiceId;
    const metadata = payload?.metadata ?? {};
    const studentId: string | undefined = metadata?.studentId;

    if (!invoiceId && !studentId) {
      return NextResponse.json({ success: false, error: "Missing invoice/student reference" }, { status: 400 });
    }

    // Re-verify server-side rather than trusting the webhook body directly.
    const verification = invoiceId ? await verifyPayment(invoiceId) : null;
    const isPaid = verification?.status === "completed" || payload?.status === "completed";

    if (studentId) {
      await getAdminDb().collection("students").doc(studentId).update({
        paymentStatus: isPaid ? "paid" : "failed",
        status: isPaid ? "Approved" : "Pending",
        paidAmount: isPaid ? (verification?.amount ?? payload?.amount ?? 0) : 0,
        piprapayVerifiedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
