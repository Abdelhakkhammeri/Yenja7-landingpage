"use client";

import { useEffect, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export default function Home() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  // 🔧 Set launch date here
  const launchDate = new Date("2026-01-01T00:00:00Z").getTime();

  useEffect(() => {
    function updateCountdown() {
      const now = Date.now();
      const diff = launchDate - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [launchDate]);

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-red-700 text-white">
      {/* Floating background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10rem] left-[20%] w-[18rem] h-[18rem] sm:w-[25rem] sm:h-[25rem] bg-red-300 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10rem] right-[15%] w-[20rem] h-[20rem] sm:w-[30rem] sm:h-[30rem] bg-white opacity-10 blur-3xl rounded-full animate-ping"></div>
        <div className="absolute top-[45%] left-[-8rem] w-[16rem] h-[16rem] sm:w-[20rem] sm:h-[20rem] bg-red-400 opacity-20 blur-2xl rounded-full"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 py-10 w-full max-w-xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold drop-shadow-lg tracking-tight">
          🚀 Yenja7
        </h1>

        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold bg-white bg-clip-text text-transparent drop-shadow-xl">
          Coming Soon
        </h2>

        {/* English */}
        <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl font-light text-white/90 max-w-md mx-auto leading-relaxed">
          The platform that helps Tunisians around the world connect with
          Tunisian businesses — launching very soon.
        </p>

        {/* French */}
        <p className="mt-2 text-sm sm:text-base font-light text-white/90 max-w-md mx-auto leading-relaxed">
          La plateforme qui aide les Tunisiens partout dans le monde à se
          connecter avec les commerces tunisiens — lancement très
          prochainement...
        </p>

        {/* Arabic */}
        <p
          className="mt-2 text-sm sm:text-base font-light text-white/90 max-w-md mx-auto leading-relaxed"
          dir="rtl"
        >
          المنصّة التي تساعد التونسيين في جميع أنحاء العالم على التواصل مع
          المتاجر والخدمات التونسية — الإطلاق قريبًا.
        </p>

        {/* Buttons: subscribe + my business */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/subscribe"
            className="inline-block w-full sm:w-auto bg-white text-red-600 font-bold text-lg sm:text-xl px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-[0.97] transition-all"
          >
            Subscribe Now
          </a>

          <a
            href="/my-business"
            className="inline-block w-full sm:w-auto bg-transparent border-2 border-white/80 text-white font-semibold text-base sm:text-lg px-8 py-3.5 rounded-2xl shadow-lg hover:bg-white/10 hover:scale-[1.02] active:scale-[0.97] transition-all"
          >
            Log in & View My Business
          </a>
        </div>

        {/* App icons */}
        <div className="mt-6 sm:mt-8 flex items-center justify-center gap-4">
          {/* Android Icon */}
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20 backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="white"
              viewBox="0 0 24 24"
              className="w-6 h-6"
            >
              <path d="M17.523 8.315l1.664-2.882a.5.5 0 10-.868-.5l-1.682 2.91A7.968 7.968 0 0012 6c-1.66 0-3.2.508-4.637 1.444L5.68 4.933a.5.5 0 10-.86.51l1.654 2.87A7.95 7.95 0 004 12c0 1.77.574 3.41 1.612 4.738l-.008.013L5 16.763V20.5a1.5 1.5 0 003 0v-2h8v2a1.5 1.5 0 003 0v-3.737l-.604-1.012A7.954 7.954 0 0020 12a7.95 7.95 0 00-2.477-5.685zM8.5 11a1 1 0 110-2 1 1 0 010 2zm7 0a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
            <span className="text-sm">Android</span>
          </div>

          {/* iOS Icon */}
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20 backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="white"
              viewBox="0 0 16 16"
              className="w-5 h-5"
            >
              <path d="M11.366 1.357c-.72.008-1.588.398-2.105.968-.46.51-.87 1.31-.755 2.073.804.064 1.628-.41 2.116-.976.488-.565.855-1.338.744-2.065zM13.14 4.403c-1.217-.06-2.262.693-2.852.693-.59 0-1.496-.664-2.46-.646-1.266.02-2.416.736-3.06 1.847-1.308 2.292-.335 5.685.926 7.543.616.895 1.345 1.894 2.32 1.86.93-.037 1.282-.602 2.408-.602 1.126 0 1.442.602 2.46.582.9-.014 1.474-.904 2.028-1.81.633-1.035.897-2.04.912-2.094-.02-.008-1.752-.673-1.77-2.667-.017-1.665 1.36-2.46 1.426-2.5-.784-1.14-2.002-1.266-2.338-1.286z" />
            </svg>
            <span className="text-sm">iOS</span>
          </div>
        </div>

        <p className="mt-3 text-xs sm:text-sm text-white/80">
          Available soon on iOS & Android
        </p>

        {/* Countdown */}
        <div className="mt-8 sm:mt-10 flex flex-wrap justify-center gap-3 sm:gap-4">
          {timeLeft ? (
            ["Days", "Hours", "Minutes", "Seconds"].map((label, i) => {
              const value = Object.values(timeLeft)[i];
              return (
                <div
                  key={label}
                  className="w-20 sm:w-24 md:w-28 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2.5 sm:py-3.5 shadow-lg"
                >
                  <div className="text-xl sm:text-2xl md:text-3xl font-extrabold">
                    {value.toString().padStart(2, "0")}
                  </div>
                  <div className="mt-1 text-[10px] sm:text-xs uppercase tracking-wide text-white/80">
                    {label}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-white/80">Calculating time…</p>
          )}
        </div>

        <p className="mt-8 sm:mt-10 text-xs sm:text-sm text-white/70">
          © {new Date().getFullYear()} Yenja7 — All rights reserved.
        </p>
      </div>
    </main>
  );
}
