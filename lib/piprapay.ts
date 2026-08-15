// ---------------------------------------------------------------------------
// PipraPay (piprapay.com) integration helper
// ---------------------------------------------------------------------------
// PipraPay is a self-hosted, open-source payment VERIFICATION gateway for
// bKash / Nagad / Rocket style manual payments (you run your own instance and
// it exposes a REST API + hosted checkout page).
//
// IMPORTANT: I don't have live web access from inside this tool, so I could
// not fetch your PipraPay instance's current API reference while building
// this. The shapes below follow PipraPay's commonly documented REST pattern
// (create-charge / verify-payments with an `mh-piprapay-api-key` header).
// Please open your own instance's API docs (usually at
// `${PIPRAPAY_BASE_URL}/docs` or the "Developer / API" tab in the merchant
// panel) and adjust field names in this file if anything doesn't match.
// ---------------------------------------------------------------------------

const BASE_URL = process.env.PIPRAPAY_BASE_URL?.replace(/\/$/, "");
const API_KEY = process.env.PIPRAPAY_API_KEY;

export interface CreateChargeInput {
  fullName: string;
  email: string;
  amount: number; // in BDT
  metadata?: Record<string, string | number>;
  redirectUrl: string;
  cancelUrl?: string;
  webhookUrl?: string;
}

export interface CreateChargeResult {
  success: boolean;
  paymentUrl?: string;
  invoiceId?: string;
  raw?: unknown;
  error?: string;
}

export async function createCharge(input: CreateChargeInput): Promise<CreateChargeResult> {
  if (!BASE_URL || !API_KEY) {
    return { success: false, error: "PipraPay is not configured. Set PIPRAPAY_BASE_URL and PIPRAPAY_API_KEY." };
  }

  try {
    const res = await fetch(`${BASE_URL}/api/create-charge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "mh-piprapay-api-key": API_KEY,
      },
      body: JSON.stringify({
        full_name: input.fullName,
        email_mobile: input.email,
        amount: input.amount,
        redirect_url: input.redirectUrl,
        cancel_url: input.cancelUrl ?? input.redirectUrl,
        webhook_url: input.webhookUrl,
        return_type: "GET",
        metadata: input.metadata ?? {},
        currency: "BDT",
      }),
    });

    const data = await res.json();

    if (!res.ok || data?.status === false) {
      return { success: false, error: data?.message ?? "PipraPay charge creation failed", raw: data };
    }

    return {
      success: true,
      paymentUrl: data?.payment_url ?? data?.paymentUrl ?? data?.pp_url,
      invoiceId: data?.invoice_id ?? data?.invoiceId ?? data?.pp_id,
      raw: data,
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown PipraPay error" };
  }
}

export interface VerifyPaymentResult {
  success: boolean;
  status?: "completed" | "pending" | "failed" | "refunded" | string;
  amount?: number;
  raw?: unknown;
  error?: string;
}

export async function verifyPayment(invoiceId: string): Promise<VerifyPaymentResult> {
  if (!BASE_URL || !API_KEY) {
    return { success: false, error: "PipraPay is not configured." };
  }

  try {
    const res = await fetch(`${BASE_URL}/api/verify-payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "mh-piprapay-api-key": API_KEY,
      },
      body: JSON.stringify({ pp_id: invoiceId }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data?.message ?? "Verification failed", raw: data };
    }

    return {
      success: true,
      status: (data?.status ?? data?.pp_status ?? "pending")?.toString().toLowerCase(),
      amount: data?.amount,
      raw: data,
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown PipraPay error" };
  }
}
