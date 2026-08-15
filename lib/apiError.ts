import { NextResponse } from "next/server";
import { FirebaseAdminConfigError } from "./firebaseAdmin";

// Turns a caught error into a JSON response. For a config problem
// (missing/bad env vars) we return the actual reason — it's safe (no
// secrets, just which var is missing) and is exactly what you need to fix
// the "সার্ভারে সমস্যা হচ্ছে" / data-not-saving issue quickly. Anything
// else stays generic for the user but is logged in full server-side.
export function handleApiError(err: unknown) {
  if (err instanceof FirebaseAdminConfigError) {
    console.error("[FirebaseAdminConfigError]", err.message);
    return NextResponse.json({ success: false, error: `সার্ভার কনফিগারেশন সমস্যা: ${err.message}` }, { status: 500 });
  }
  console.error(err);
  const detail = err instanceof Error ? err.message : String(err);
  // Full detail only outside production (local dev / preview) — logged
  // server-side either way so you can check Vercel/host logs in production.
  const body: Record<string, unknown> = { success: false, error: "সার্ভার সমস্যা, আবার চেষ্টা করুন" };
  if (process.env.NODE_ENV !== "production") body.detail = detail;
  return NextResponse.json(body, { status: 500 });
}
