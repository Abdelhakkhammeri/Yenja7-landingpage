// "use client";

// import { useState } from "react";

// type Step2Props = {
//   onBack: () => void;
//   onNext: () => void;
// };

// export default function Step2({ onBack, onNext }: Step2Props) {
//   const [businessName, setBusinessName] = useState("");
//   const [description, setDescription] = useState("");
//   const [error, setError] = useState<string | null>(null);

//   function handleNext() {
//     if (!businessName.trim()) {
//       setError("Business name is required.");
//       return;
//     }

//     setError(null);

//     // Later we can lift businessName + description to parent state
//     onNext();
//   }

//   return (
//     <div>
//       <h2 className="text-xl font-bold mb-4 text-center">Business details</h2>

//       <p className="text-sm text-white/80 mb-6 text-center">
//         Enter the name of your business and a short description. You can change this later.
//       </p>

//       {/* Business name (required) */}
//       <label className="block text-sm mb-1">Business name *</label>
//       <input
//         type="text"
//         placeholder="Ex: Restaurant El Medina"
//         value={businessName}
//         onChange={(e) => setBusinessName(e.target.value)}
//         className={`w-full px-4 py-3 rounded-xl border ${
//           !businessName && error
//             ? "border-red-300 bg-red-500/20"
//             : "border-white/30 bg-white/20"
//         } text-white placeholder-white/60 mb-4 focus:outline-none focus:ring-2 focus:ring-white/50`}
//       />

//       {/* Description (optional) */}
//       <label className="block text-sm mb-1">Description (optional)</label>
//       <textarea
//         rows={3}
//         placeholder="Ex: Tunisian family restaurant with couscous, brik, ojja…"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//         className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/60 mb-6 focus:outline-none focus:ring-2 focus:ring-white/50"
//       />

//       {error && (
//         <p className="text-xs text-red-200 bg-red-500/20 border border-red-300/60 rounded-lg px-3 py-2 mb-4">
//           {error}
//         </p>
//       )}

//       <div className="flex justify-between">
//         <button
//           type="button"
//           onClick={onBack}
//           className="px-6 py-3 bg-white/20 border border-white/40 rounded-xl text-sm font-semibold hover:bg-white/25 transition-all"
//         >
//           Back
//         </button>

//         <button
//           type="button"
//           onClick={handleNext}
//           className="px-8 py-3 bg-white text-red-600 font-bold rounded-xl text-sm sm:text-base hover:scale-[1.02] active:scale-[0.97] transition-all shadow-xl"
//         >
//           Continue
//         </button>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";

type Step2Props = {
  businessName: string;
  setBusinessName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function Step2({
  businessName,
  setBusinessName,
  description,
  setDescription,
  onBack,
  onNext,
}: Step2Props) {
  const [error, setError] = useState<string | null>(null);

  function handleNext() {
    if (!businessName.trim()) {
      setError("Business name is required. (Nom du commerce obligatoire)");
      return;
    }

    setError(null);
    onNext();
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-center">
        Business details (Détails du commerce)
      </h2>

      <p className="text-sm text-white/80 mb-6 text-center">
        Enter the name of your business and a short description.
        <br />
        <span className="text-white/70">
          (Indiquez le nom de votre commerce et une courte description.)
        </span>
      </p>

      {/* Business name (required) */}
      <label className="block text-sm mb-1">
        Business name (Nom du commerce) *
      </label>
      <input
        type="text"
        placeholder="Ex: Restaurant El Medina"
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
        className={`w-full px-4 py-3 rounded-xl border text-sm sm:text-base
          ${
            !businessName && error
              ? "border-red-300 bg-red-500/20"
              : "border-white/30 bg-white/20"
          }
          text-white placeholder-white/60 mb-4
          focus:outline-none focus:ring-2 focus:ring-white/50`}
      />

      {/* Description (optional) */}
      <label className="block text-sm mb-1">
        Description (optional / facultatif)
      </label>
      <textarea
        rows={3}
        placeholder="Ex: Tunisian family restaurant with couscous, brik, ojja…"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/60 mb-6 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
      />

      {error && (
        <p className="text-xs text-red-200 bg-red-500/20 border border-red-300/60 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-4 py-3 bg-white/20 border border-white/40 rounded-xl text-sm font-semibold hover:bg-white/25 transition-all"
        >
          Back (Retour)
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex-1 px-4 py-3 bg-white text-red-600 font-bold rounded-xl text-sm sm:text-base hover:scale-[1.02] active:scale-[0.97] transition-all shadow-xl"
        >
          Continue (Continuer)
        </button>
      </div>
    </div>
  );
}
