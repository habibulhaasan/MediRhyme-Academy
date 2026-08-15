import { NextResponse } from "next/server";
import { getAdminDb, isFirebaseAdminConfigured, FirebaseAdminConfigError } from "@/lib/firebaseAdmin";

// Visit /api/health in the browser (or `curl`) after deploying to check
// exactly what's wrong when registrations aren't saving. It never returns
// secret values — only which env vars are present, the config error
// message (safe — it never contains the key itself), and whether a real
// Firestore write/read round-trip succeeds.
export async function GET() {
  const clientEnv = {
    NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const adminEnv = {
    FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64: !!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64,
    FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON: !!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON,
    FIREBASE_ADMIN_PROJECT_ID: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
    FIREBASE_ADMIN_CLIENT_EMAIL: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    FIREBASE_ADMIN_PRIVATE_KEY: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  };

  const adminConfigured = isFirebaseAdminConfigured();
  let configError: string | null = null;
  let firestoreWriteRead: { ok: boolean; error?: string } = { ok: false, error: "skipped (admin not configured)" };

  if (adminConfigured) {
    try {
      const ref = getAdminDb().collection("_health_check").doc("ping");
      await ref.set({ at: new Date().toISOString() });
      const snap = await ref.get();
      firestoreWriteRead = { ok: snap.exists };
    } catch (err) {
      firestoreWriteRead = { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  } else {
    try {
      getAdminDb();
    } catch (err) {
      configError = err instanceof FirebaseAdminConfigError ? err.message : (err instanceof Error ? err.message : String(err));
    }
  }

  const piprapayConfigured = !!(process.env.PIPRAPAY_BASE_URL && process.env.PIPRAPAY_API_KEY);

  return NextResponse.json({
    clientEnv,
    adminEnv,
    adminConfigured,
    configError,
    firestoreWriteRead,
    piprapayConfigured,
    hint: !adminConfigured
      ? `Firebase Admin failed to initialize — see "configError" above. If it mentions a DECODER/PEM/private key ` +
        `error, switch to FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64 (base64 of the full, unedited service account ` +
        `JSON) instead of the three separate vars — see README 'Troubleshooting'.`
      : !firestoreWriteRead.ok
      ? "Admin env vars are present but the test write/read failed — check the error above (often: Firestore database not created yet, or wrong project ID)."
      : "Firebase Admin looks correctly configured.",
  });
}