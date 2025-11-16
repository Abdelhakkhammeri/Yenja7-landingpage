"use client";

import { useState } from "react";

type OpeningHours = {
  [day: string]: {
    open: string;
    close: string;
    closed?: boolean;
  };
};

type Step4Props = {
  openingHours: OpeningHours | null;
  setOpeningHours: (value: OpeningHours) => void;
  onBack: () => void;
  onNext: () => void;
};

const days: { key: string; label: string }[] = [
  { key: "monday", label: "Monday / Lundi" },
  { key: "tuesday", label: "Tuesday / Mardi" },
  { key: "wednesday", label: "Wednesday / Mercredi" },
  { key: "thursday", label: "Thursday / Jeudi" },
  { key: "friday", label: "Friday / Vendredi" },
  { key: "saturday", label: "Saturday / Samedi" },
  { key: "sunday", label: "Sunday / Dimanche" },
];

function createDefaultOpeningHours(): OpeningHours {
  const result: OpeningHours = {};
  for (const d of days) {
    result[d.key] = {
      open: "",
      close: "",
      closed: true, // by default CLOSED, user chooses what is open
    };
  }
  return result;
}

export default function Step4({
  openingHours,
  setOpeningHours,
  onBack,
  onNext,
}: Step4Props) {
  // Local state: if we already have openingHours (user went back), reuse them
  const [localHours, setLocalHours] = useState<OpeningHours>(
    openingHours ?? createDefaultOpeningHours()
  );
  const [error, setError] = useState<string | null>(null);

  function updateDay(
    dayKey: string,
    patch: Partial<{ open: string; close: string; closed: boolean }>
  ) {
    setLocalHours((prev) => {
      const prevDay = prev[dayKey] ?? { open: "", close: "", closed: true };
      return {
        ...prev,
        [dayKey]: {
          ...prevDay,
          ...patch,
        },
      };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Simple validation: at least one open day with both open & close times
    const hasAnyOpen = days.some(({ key }) => {
      const day = localHours[key];
      if (!day || day.closed) return false;
      return Boolean(day.open && day.close);
    });

    if (!hasAnyOpen) {
      setError(
        "Please set the opening hours for at least one day. (Veuillez définir les horaires pour au moins un jour.)"
      );
      return;
    }

    setError(null);
    setOpeningHours(localHours);
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-center">
        Opening hours (Horaires d&apos;ouverture)
      </h2>

      <p className="text-sm text-white/80 text-center">
        Choose the days when your business is open, then select the opening and
        closing times. No default hours are set.
        <br />
        <span className="text-white/70">
          (Choisissez les jours d&apos;ouverture puis indiquez les horaires.
          Aucun horaire n&apos;est pré-rempli.)
        </span>
      </p>

      {/* Days grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {days.map(({ key, label }) => {
          const dayData = localHours[key] ?? {
            open: "",
            close: "",
            closed: true,
          };
          const isClosed = dayData.closed ?? false;

          return (
            <div
              key={key}
              className="rounded-2xl border border-white/25 bg-white/10 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-white">
                  {label}
                </span>

                <label className="flex items-center gap-2 text-xs text-white/80">
                  <input
                    type="checkbox"
                    checked={isClosed}
                    onChange={(e) =>
                      updateDay(key, { closed: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-white/60 bg-transparent"
                  />
                  <span>{isClosed ? "Closed / Fermé" : "Open / Ouvert"}</span>
                </label>
              </div>

              {/* Time pickers only if day is open */}
              {!isClosed && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] mb-1 text-white/80">
                      Opens at (Ouvre à)
                    </label>
                    <input
                      type="time"
                      value={dayData.open}
                      onChange={(e) =>
                        updateDay(key, { open: e.target.value })
                      }
                      className="w-full px-2 py-2 rounded-xl border border-white/40 bg-white text-xs text-black focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] mb-1 text-white/80">
                      Closes at (Ferme à)
                    </label>
                    <input
                      type="time"
                      value={dayData.close}
                      onChange={(e) =>
                        updateDay(key, { close: e.target.value })
                      }
                      className="w-full px-2 py-2 rounded-xl border border-white/40 bg-white text-xs text-black focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-200 bg-red-500/20 border border-red-300/60 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Buttons */}
      <div className="flex justify-between gap-3 mt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-4 py-3 bg-white/20 border border-white/40 rounded-xl text-sm font-semibold hover:bg-white/25 transition-all"
        >
          Back (Retour)
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-white/20 border border-white/40 rounded-xl text-sm font-semibold hover:bg-white/25 transition-all"
        >
          Next (Suivant)
        </button>
      </div>
    </form>
  );
}
