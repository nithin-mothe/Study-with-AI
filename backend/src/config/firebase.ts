import admin from "firebase-admin";
import { env } from "./env";

let app: admin.app.App | null = null;

export function getFirebaseAdminApp() {
  if (!app) {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      })
    });
  }

  return app;
}

export function getFirestore() {
  return getFirebaseAdminApp().firestore();
}

export function getFirebaseAuth() {
  return getFirebaseAdminApp().auth();
}
