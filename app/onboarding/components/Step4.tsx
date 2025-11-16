// "use client";

// import { useState } from "react";

// type OpeningHours = {
//   open: string;
//   close: string;
//   closed: boolean;
// };

// type Step4Props = {
//   onBack: () => void;
//   onNext: () => void;
// };

// const days = [
//   "Monday",
//   "Tuesday",
//   "Wednesday",
//   "Thursday",
//   "Friday",
//   "Saturday",
//   "Sunday",
// ];

// export default function Step4({ onBack, onNext }: Step4Props) {
//   // Default opening hours: 09:00 → 17:00
//   const [hours, setHours] = useState<Record<string, OpeningHours>>(() => {
//     const initial: Record<string, OpeningHours> = {};
//     days.forEach((day) => {
//       initial[day] = {
//         open: "09:00",
//         close: "17:00",
//         closed: false,
//       };
//     });
//     return initial;
//   });

//   function updateDay(day: string, patch: Partial<OpeningHours>) {
//     setHours((prev) => ({
//       ...prev,
//       [day]: {
//         ...prev[day],
//         ...patch,
//       },
//     }));
//   }

//   function handleNext() {
//     // Later: Save in Firestore
//     console.log("Opening hours:", hours);
//     onNext();
//   }

//   return (
//     <div>
//       <h2 className="text-xl font-bold mb-2 text-center">
//         Opening hours
//       </h2>
//       <p className="text-sm text-white/80 mb-4 text-center">
//         Default hours are set to 09:00 - 17:00. You can adjust them.
//       </p>

//       <div className="max-h-72 overflow-y-auto pr-1 mb-6 space-y-3">
//         {days.map((day) => {
//           const dayData = hours[day];
//           return (
//             <div
//               key={day}
//               className="bg-white/10 border border-white/25 rounded-2xl px-3 py-3"
//             >
//               {/* Day title + closed toggle */}
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm font-semibold">{day}</span>

//                 <label className="flex items-center gap-1 text-[11px]">
//                   <input
//                     type="checkbox"
//                     checked={dayData.closed}
//                     onChange={(e) =>
//                       updateDay(day, { closed: e.target.checked })
//                     }
//                     className="w-3 h-3 rounded bg-white/20 border-white/60"
//                   />
//                   <span>Closed</span>
//                 </label>
//               </div>

//               {/* Hours fields */}
//               {!dayData.closed && (
//                 <div className="flex gap-2">
//                   <div className="flex-1">
//                     <label className="block text-[11px] mb-1">
//                       Opens
//                     </label>
//                     <input
//                       type="time"
//                       value={dayData.open}
//                       onChange={(e) =>
//                         updateDay(day, { open: e.target.value })
//                       }
//                       className="w-full px-2 py-2 rounded-xl border border-white/30 bg-white/20 text-white text-xs focus:outline-none focus:ring-2 focus:ring-white/50"
//                     />
//                   </div>

//                   <div className="flex-1">
//                     <label className="block text-[11px] mb-1">
//                       Closes
//                     </label>
//                     <input
//                       type="time"
//                       value={dayData.close}
//                       onChange={(e) =>
//                         updateDay(day, { close: e.target.value })
//                       }
//                       className="w-full px-2 py-2 rounded-xl border border-white/30 bg-white/20 text-white text-xs focus:outline-none focus:ring-2 focus:ring-white/50"
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

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

import { OpeningHours } from "../page";

type Props = {
  openingHours: OpeningHours | null;
  setOpeningHours: (v: OpeningHours | null) => void;
  onNext: () => void;
  onBack: () => void;
};

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function Step4({
  openingHours,
  setOpeningHours,
  onNext,
  onBack,
}: Props) {
  const data: OpeningHours =
    openingHours ??
    DAYS.reduce((acc, day) => {
      acc[day] = { open: "09:00", close: "17:00", closed: false };
      return acc;
    }, {} as OpeningHours);

  function updateDay(
    day: string,
    field: "open" | "close" | "closed",
    value: string | boolean
  ) {
    const next: OpeningHours = { ...data };
    next[day] = { ...next[day], [field]: value };
    setOpeningHours(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOpeningHours(data);
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold mb-2">
        Opening hours (Horaires d&apos;ouverture)
      </h2>
      <p className="text-sm text-white/80 mb-4">
        Default is 09:00–17:00. Adjust days that are different or closed.
      </p>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {DAYS.map((day) => {
          const d = data[day];
          return (
            <div
              key={day}
              className="flex items-center gap-2 text-xs sm:text-sm"
            >
              <span className="w-24 capitalize">{day}</span>
              <label className="flex items-center gap-1 text-[11px]">
                <input
                  type="checkbox"
                  checked={!!d.closed}
                  onChange={(e) =>
                    updateDay(day, "closed", e.target.checked)
                  }
                />
                Closed
              </label>
              {!d.closed && (
                <>
                  <input
                    type="time"
                    value={d.open}
                    onChange={(e) =>
                      updateDay(day, "open", e.target.value)
                    }
                    className="rounded-lg px-2 py-1 text-black"
                  />
                  <span>–</span>
                  <input
                    type="time"
                    value={d.close}
                    onChange={(e) =>
                      updateDay(day, "close", e.target.value)
                    }
                    className="rounded-lg px-2 py-1 text-black"
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-white/10 border border-white/30 text-sm"
        >
          Back (Retour)
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-white text-red-600 font-semibold text-sm"
        >
          Next (Suivant)
        </button>
      </div>
    </form>
  );
}
