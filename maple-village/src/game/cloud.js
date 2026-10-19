// Cloud saves (phase 6): Google sign-in and Firestore, for the public game at honey-brook.web.app. Each signed-in
// player's three slots live under players/{uid}/slot{N}/{fox, today, routines, journal, ...}; the security rules
// (firestore.rules) let a player read and write only their own. Not signed in: the game plays and saves in this
// browser only, as before.
// The game talks to a small database shape (collection(path).doc(id) with get/set/onSnapshot, as the dev builds'
// stand-in has), so this file is the only place that knows about Firebase.
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, doc as fsDoc, getDoc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { FIREBASE_CONFIG } from "../firebase-config.js";

let app = null, auth = null, fs = null;
const start = () => { if (!app) { app = initializeApp(FIREBASE_CONFIG); auth = getAuth(app); fs = initializeFirestore(app, {localCache: persistentLocalCache()}); } };

// one document, in the shape the game expects (snap.exists, snap.data(), snap.metadata.fromCache)
const wrap = s => ({id: s.id, exists: s.exists(), data: () => s.data(), metadata: {fromCache: s.metadata.fromCache, hasPendingWrites: s.metadata.hasPendingWrites}});
const docAt = path => { const r = fsDoc(fs, path);
  return {id: r.id, path, get: async () => wrap(await getDoc(r)), set: async v => setDoc(r, v), delete: async () => deleteDoc(r),
    onSnapshot: (next, err) => onSnapshot(r, {includeMetadataChanges: true}, s => next(wrap(s)), err || (() => {}))}; };
const collectionAt = path => ({path, doc: id => docAt(path + "/" + id)});

// the signed-in player -> {uid, name, email} or null; fires now and on every change
export function watchPlayer(fn){ start(); return onAuthStateChanged(auth, u => fn(u ? {uid: u.uid, name: u.displayName || "", email: u.email || ""} : null)); }
export async function signInGoogle(){
  start(); const p = new GoogleAuthProvider();
  try { await signInWithPopup(auth, p); } catch (e) { if (e && /popup-blocked|operation-not-supported/.test(e.code || "")) await signInWithRedirect(auth, p); else throw e; }
}
export const signOutPlayer = () => { start(); return signOut(auth); };
// email and password: sign in, make an account, or send a reset link. -> null when it worked, else a friendly message
const WHY = {"auth/invalid-email": "That email address doesn't look quite right.", "auth/missing-password": "Type a password too.",
  "auth/weak-password": "Pick a password of at least six characters.", "auth/email-already-in-use": "There's already an account with that email. Try signing in instead.",
  "auth/invalid-credential": "That email and password don't match. Try again, or reset your password.", "auth/wrong-password": "That email and password don't match. Try again, or reset your password.",
  "auth/user-not-found": "No account with that email yet. Make one instead?", "auth/too-many-requests": "Too many tries. Take a breather and try again in a few minutes.",
  "auth/network-request-failed": "Couldn't reach the internet just now. Try again in a moment.", "auth/operation-not-allowed": "Email sign-in isn't switched on yet. Use Google for now."};
const said = e => WHY[(e && e.code) || ""] || "That didn't go through. Try again in a moment.";
export async function emailSignIn(email, pw){ start(); try { await signInWithEmailAndPassword(auth, email.trim(), pw); return null; } catch (e) { return said(e); } }
export async function emailSignUp(email, pw){ start(); try { await createUserWithEmailAndPassword(auth, email.trim(), pw); return null; } catch (e) { return said(e); } }
export async function emailReset(email){ start(); try { await sendPasswordResetEmail(auth, email.trim()); return null; } catch (e) { return said(e); } }
// a slot's collection of documents in the cloud (the player must be signed in)
export const slotCollection = (uid, n) => { start(); return collectionAt(`players/${uid}/slot${n}`); };
// the docs a slot keeps (so a deleted slot can be cleared from the cloud too)
export const SLOT_DOCS = ["fox", "today", "routines", "journal", "playing"];
