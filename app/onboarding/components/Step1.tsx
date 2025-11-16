"use client";

import { useState } from "react";
import type { CategoryDetails } from "../page";

const categories = [
  { id: "restaurant", label: "Restaurants", emoji: "🥘" },
  { id: "grocery", label: "Grocery Stores", emoji: "🛒" },
  { id: "cafe", label: "Cafés", emoji: "☕" },
  { id: "hairdresser", label: "Hairdressers", emoji: "💇" },
  { id: "doctor", label: "Doctors", emoji: "🧑‍⚕️" },
  { id: "dentist", label: "Dentists", emoji: "🦷" },
  { id: "mechanic", label: "Mechanics", emoji: "🔧" },
  { id: "painter", label: "Painters", emoji: "🎨" },
  { id: "plumber", label: "Plumbers", emoji: "🚰" },
  { id: "driving_school", label: "Driving Schools", emoji: "🚗" },
  {
    id: "transport_delivery",
    label: "Transport / Delivery Services",
    emoji: "📦",
  },
  { id: "other", label: "Others", emoji: "🗂️" },
];

const doctorSpecialties = [
  "General practitioner",
  "Pediatrician",
  "Gynecologist",
  "Cardiologist",
  "Dermatologist",
  "Psychologist / Psychiatrist",
  "Orthopedist",
  "ENT (Ear, Nose, Throat)",
  "Other specialist",
];

export default function Step1({
  onNext,
  initialCategory,
  initialDetails,
}: {
  onNext: (category: string, details: CategoryDetails) => void;
  initialCategory?: string | null;
  initialDetails?: CategoryDetails | null;
}) {
  const [selected, setSelected] = useState<string | null>(
    initialCategory ?? null
  );
  const [details, setDetails] = useState<CategoryDetails>(
    initialDetails ?? {
      halalMeat: null,
      serveAlcohol: null,
      hairType: null,
      doctorSpecialties: null,
    }
  );
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c.id === selected);

  function handleContinue() {
    if (!selected) {
      setError("Please choose a category to continue.");
      return;
    }

    setError(null);
    onNext(selected, details);
  }

  const showRestaurantCafeOptions =
    selected === "restaurant" || selected === "cafe";
  const showHairdresserOptions = selected === "hairdresser";
  const showDoctorOptions = selected === "doctor";

  return (
    <div>
      <h2 className="text-xl font-bold mb-3 text-white text-center">
        What type of business do you have?
      </h2>
      <p className="text-sm text-white/80 mb-6 text-center">
        Choose the category that best matches your Tunisian business.
      </p>

      {/* Category grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {categories.map((cat) => {
          const isActive = selected === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelected(cat.id);
                setError(null);
              }}
              className={`flex flex-col items-start justify-between rounded-2xl px-4 py-3 text-left border transition-all
                ${
                  isActive
                    ? "bg-white text-red-600 border-white shadow-lg scale-[1.03]"
                    : "bg-white/10 text-white border-white/30 hover:bg-white/20"
                }`}
            >
              <span className="text-2xl mb-1">{cat.emoji}</span>
              <span className="text-xs font-semibold leading-snug">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Extra options for some categories */}
      {selectedCategory && (
        <div className="mt-4 space-y-4">
          {/* Restaurants / Cafés */}
          {showRestaurantCafeOptions && (
            <div className="bg-white/10 border border-white/30 rounded-2xl p-4">
              <p className="text-sm font-semibold mb-3">
                Extra details for {selectedCategory.label}
              </p>

              {/* Halal meat */}
              <div className="mb-3">
                <p className="text-xs mb-2">
                  Halal meat{" "}
                  <span className="text-white/60">(Viande halal)</span> ?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setDetails((prev) => ({ ...prev, halalMeat: true }))
                    }
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${
                      details.halalMeat === true
                        ? "bg-white text-red-600 border-white"
                        : "bg-white/10 border-white/40"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDetails((prev) => ({ ...prev, halalMeat: false }))
                    }
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${
                      details.halalMeat === false
                        ? "bg-white text-red-600 border-white"
                        : "bg-white/10 border-white/40"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Serve alcohol */}
              <div>
                <p className="text-xs mb-2">
                  Serve alcohol ?{" "}
                  <span className="text-white/60">(Alcool servi)</span>
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setDetails((prev) => ({ ...prev, serveAlcohol: true }))
                    }
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${
                      details.serveAlcohol === true
                        ? "bg-white text-red-600 border-white"
                        : "bg-white/10 border-white/40"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDetails((prev) => ({ ...prev, serveAlcohol: false }))
                    }
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${
                      details.serveAlcohol === false
                        ? "bg-white text-red-600 border-white"
                        : "bg-white/10 border-white/40"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hairdressers */}
          {showHairdresserOptions && (
            <div className="bg-white/10 border border-white/30 rounded-2xl p-4">
              <p className="text-sm font-semibold mb-3">
                Hairdresser type (Salon de coiffure)
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "men", label: "Men" },
                  { id: "women", label: "Women" },
                  { id: "both", label: "Both" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setDetails((prev) => ({
                        ...prev,
                        hairType: opt.id as CategoryDetails["hairType"],
                      }))
                    }
                    className={`flex-1 min-w-[30%] py-2 rounded-xl text-xs font-semibold border ${
                      details.hairType === opt.id
                        ? "bg-white text-red-600 border-white"
                        : "bg-white/10 border-white/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Doctors */}
          {showDoctorOptions && (
            <div className="bg-white/10 border border-white/30 rounded-2xl p-4">
              <p className="text-sm font-semibold mb-3">
                Doctor specialty (Spécialité)
              </p>
              <p className="text-[11px] text-white/70 mb-2">
                Select the main medical specialty.
              </p>
              <div className="flex flex-wrap gap-2">
                {doctorSpecialties.map((spec) => {
                  const active = details.doctorSpecialties === spec;
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() =>
                        setDetails((prev) => ({
                          ...prev,
                          doctorSpecialties: spec, // SINGLE selection
                        }))
                      }
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border ${
                        active
                          ? "bg-white text-red-600 border-white"
                          : "bg-white/10 border-white/40"
                      }`}
                    >
                      {spec}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-200 bg-red-500/20 border border-red-300/60 rounded-lg px-3 py-2 mt-4">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleContinue}
        className="w-full mt-4 bg-white text-red-600 font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-[0.97] transition-all shadow-xl"
      >
        Continue
      </button>
    </div>
  );
}
