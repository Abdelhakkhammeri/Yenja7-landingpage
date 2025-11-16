"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { onAuthStateChanged, User, signOut } from "firebase/auth";

type Submission = {
  id: string;
  status: string;
  createdAt?: { seconds: number; nanoseconds: number } | null;
  category?: string | null;
  imagesCount?: number;
};

export default function MyBusinessPage() {
  const [user, setUser] = useState<User | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser || null);

      if (!firebaseUser) {
        setSubmission(null);
        setLoading(false);
        setAuthChecked(true);
        return;
      }

      try {
        const q = query(
          collection(db, "businessSubmissions"),
          where("ownerId", "==", firebaseUser.uid),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data() as any;
          setSubmission({
            id: doc.id,
            status: data.status || "pending",
            category: data.category ?? null,
            imagesCount: data.imagesCount ?? 0,
            createdAt: data.createdAt ?? null,
          });
        } else {
          setSubmission(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    });

    return () => unsub();
  }, []);

  const notLoggedInView = (
    <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
      <h1 className="text-2xl font-bold mb-3">My Business</h1>
      <p className="text-sm text-white/80 mb-6">
        You are not logged in. Please log in to see your business submission.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="/login"
          className="w-full sm:w-auto inline-block px-6 py-3 rounded-2xl bg-white text-red-600 font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.97] transition-all"
        >
          Log in
        </a>
        <a
          href="/subscribe"
          className="w-full sm:w-auto inline-block px-6 py-3 rounded-2xl border border-white/70 text-white font-semibold hover:bg-white/10 transition-all"
        >
          Create account
        </a>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-red-700 text-white flex items-center justify-center px-6">
      {(!authChecked || loading) && (
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">My Business</h1>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="h-8 w-8 rounded-full border-2 border-white border-t-transparent animate-spin mb-3" />
            <p className="text-sm text-white/80">Loading your information…</p>
          </div>
        </div>
      )}

      {authChecked && !loading && !user && notLoggedInView}

      {authChecked && !loading && user && (
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
          <h1 className="text-2xl font-bold mb-4 text-center">
            My Business
          </h1>

          {submission ? (
            <div>
              <p className="text-sm text-white/80 mb-2">
                Submission ID:{" "}
                <span className="font-mono text-xs">{submission.id}</span>
              </p>

              {submission.category && (
                <p className="text-sm mb-2">
                  Category:{" "}
                  <span className="font-semibold">
                    {submission.category}
                  </span>
                </p>
              )}

              <p className="text-sm mb-2">
                Photos attached:{" "}
                <span className="font-semibold">
                  {submission.imagesCount}
                </span>
              </p>

              <p className="text-sm mb-4">
                Status:{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    submission.status === "approved"
                      ? "bg-emerald-400/20 text-emerald-200 border border-emerald-300/60"
                      : "bg-yellow-400/20 text-yellow-100 border border-yellow-300/60"
                  }`}
                >
                  {submission.status === "approved"
                    ? "Approved"
                    : "Waiting for approval"}
                </span>
              </p>

              <p className="text-xs text-white/70 mb-4">
                Once an admin reviews your submission, your status will change
                to <span className="font-semibold">Approved</span>.
              </p>
            </div>
          ) : (
            <p className="text-sm text-white/80 mb-4">
              You are logged in but you don&apos;t have any business
              submission yet.
            </p>
          )}

          {/* 🔥 Logout Button */}
          <button
            onClick={() => signOut(auth)}
            className="mt-4 w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all"
          >
            Log out
          </button>
        </div>
      )}
    </main>
  );
}
