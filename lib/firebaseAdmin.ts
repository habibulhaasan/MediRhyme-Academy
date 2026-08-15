// Server-only Firebase Admin initialization. Never import this from a client component.
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

// Lazily initialized so importing this module doesn't crash the build (or a
// route that doesn't actually touch Firestore) when admin env vars aren't
// set yet. Call `getAdminDb()` inside request handlers, not at module scope.
export function getAdminDb() {
  return getFirestore(getAdminApp());
}
