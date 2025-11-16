"use client";

import { FormEvent, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SubscribePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // 1) Create user in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // 2) Store user profile in Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        fullName,
        email,
        createdAt: serverTimestamp(),
        source: "landing_subscribe",
        role: "business_owner_candidate",
      });

        setMessage("Account created! Redirecting...");
            setTimeout(() => {
            window.location.href = "/onboarding";
            }, 1200);
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
     } catch (err: any) {
      console.error("Firebase error:", err);
      let msg = "Something went wrong. Please try again.";

      if (err.code === "auth/email-already-in-use") {
        msg = "This email is already used. Try logging in or use another email.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      } else if (err.code === "permission-denied") {
        msg = "We couldn't save your profile (permissions issue). Please contact support.";
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-red-500 to-red-700 text-white px-6">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-10 max-w-lg w-full shadow-2xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-center">
          Subscribe to Yenja7
        </h1>

        <p className="text-sm sm:text-base text-white/80 mb-6 text-center">
          Create your account now. It will be used later in the Yenja7 app to
          manage your business profile.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-white mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/15 text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/15 text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/15 text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/15 text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          {error && (
            <p className="text-xs sm:text-sm text-red-200 bg-red-500/20 border border-red-300/60 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {message && (
            <p className="text-xs sm:text-sm text-emerald-100 bg-emerald-500/20 border border-emerald-300/60 rounded-lg px-3 py-2">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-red-600 font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-[0.97] transition-all shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating your account..." : "Create my Yenja7 account"}
          </button>
        </form>

        <p className="mt-6 text-xs text-white/60 text-center">
          We respect your privacy — your account will be used only for Yenja7.
        </p>
      </div>
    </main>
  );
}
