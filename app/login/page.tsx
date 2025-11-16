"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/my-business");
    } catch (err: any) {
      console.error(err);
      let msg = "Login failed. Please check your email and password.";
      if (err.code === "auth/user-not-found") {
        msg = "No account found with this email.";
      } else if (err.code === "auth/wrong-password") {
        msg = "Incorrect password.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Invalid email address.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-red-700 text-white">
      {/* background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10rem] left-[20%] w-[18rem] h-[18rem] sm:w-[25rem] sm:h-[25rem] bg-red-300 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10rem] right-[15%] w-[20rem] h-[20rem] sm:w-[30rem] sm:h-[30rem] bg-white opacity-10 blur-3xl rounded-full animate-ping"></div>
        <div className="absolute top-[45%] left-[-8rem] w-[16rem] h-[16rem] sm:w-[20rem] sm:h-[20rem] bg-red-400 opacity-20 blur-2xl rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl mx-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center mb-2">
          Log in to Yenja7
        </h1>
        <p className="text-sm text-white/80 text-center mb-6">
          Use the same email and password you used when subscribing your business.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/15 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/15 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="********"
            />
          </div>

          {error && (
            <p className="text-xs text-red-200 bg-red-500/20 border border-red-300/60 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-white text-red-600 font-bold py-3 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-[0.97] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-4 text-xs text-white/75 text-center">
          Don&apos;t have an account yet?{" "}
          <a
            href="/subscribe"
            className="font-semibold underline underline-offset-2"
          >
            Subscribe your business
          </a>
        </p>
      </div>
    </main>
  );
}
