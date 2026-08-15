import * as admin from "firebase-admin";

/**
 * Thrown when Firebase Admin can't be configured/initialized.
 * Callers (e.g. the /api/health route) catch this to show a clear reason
 * instead of a generic crash.
 */
export class FirebaseAdminConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FirebaseAdminConfigError";
  }
}

function buildCredential(): admin.credential.Credential {
  // 1. Base64-encoded full service account JSON (recommended)
  if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64) {
    const json = Buffer.from(
      process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64,
      "base64"
    ).toString("utf8");
    return admin.credential.cert(JSON.parse(json));
  }

  // 2. Raw JSON string
  if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON) {
    return admin.credential.cert(
      JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON)
    );
  }

  // 3. Three separate fields
  if (
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    return admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }

  throw new FirebaseAdminConfigError(
    "Firebase Admin credentials missing from environment variables. Set " +
      "FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64 (recommended) or the three " +
      "FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / " +
      "FIREBASE_ADMIN_PRIVATE_KEY fields."
  );
}

let lastInitError: string | null = null;

/** Initializes (once) and returns the admin app, or null if config is bad. */
function ensureApp(): admin.app.App | null {
  if (admin.apps.length && admin.apps[0]) {
    return admin.apps[0];
  }
  try {
    const credential = buildCredential();
    lastInitError = null;
    return admin.initializeApp({ credential });
  } catch (err) {
    lastInitError =
      err instanceof Error ? err.message : String(err);
    // Don't rethrow here — let callers decide what to do (e.g. the
    // health route wants to report this, not crash the whole process).
    console.error("Firebase Admin Initialization Error:", lastInitError);
    return null;
  }
}

export function isFirebaseAdminConfigured(): boolean {
  return ensureApp() !== null;
}

export function getAdminDb(): admin.firestore.Firestore {
  const app = ensureApp();
  if (!app) {
    throw new FirebaseAdminConfigError(
      lastInitError || "Firebase Admin is not configured."
    );
  }
  return app.firestore();
}

export function getAdminAuth(): admin.auth.Auth {
  const app = ensureApp();
  if (!app) {
    throw new FirebaseAdminConfigError(
      lastInitError || "Firebase Admin is not configured."
    );
  }
  return app.auth();
}