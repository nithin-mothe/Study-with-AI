"use client";

import {
  type Auth,
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User
} from "firebase/auth";
import { getFirebaseApp } from "./config";

let cachedAuth: Auth | null = null;

export function getClientAuth() {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth is only available in the browser");
  }

  if (!cachedAuth) {
    cachedAuth = getAuth(getFirebaseApp());
  }

  return cachedAuth;
}

export function observeAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(getClientAuth(), callback);
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(getClientAuth(), provider);
}

export async function signOutUser() {
  await signOut(getClientAuth());
}
