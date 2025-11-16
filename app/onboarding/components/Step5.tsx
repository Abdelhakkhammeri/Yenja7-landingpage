// "use client";

// import { useState } from "react";

// type Step5Props = {
//   onBack: () => void;
//   onNext: () => void;
// };

// export default function Step5({ onBack, onNext }: Step5Props) {
//   const [website, setWebsite] = useState("");
//   const [facebook, setFacebook] = useState("");
//   const [instagram, setInstagram] = useState("");
//   const [tiktok, setTiktok] = useState("");
//   const [whatsapp, setWhatsapp] = useState("");

//   const [error, setError] = useState<string | null>(null);

//   function handleContinue() {
//     if (!whatsapp.trim()) {
//       setError("WhatsApp (link or phone) is required.");
//       return;
//     }

//     setError(null);

//     // Later: save these in parent state / Firestore
//     console.log("Social links:", {
//       website,
//       facebook,
//       instagram,
//       tiktok,
//       whatsapp,
//     });

//     onNext();
//   }

//   return (
//     <div>
//       <h2 className="text-xl font-bold mb-2 text-center">
//         Online presence
//       </h2>
//       <p className="text-sm text-white/80 mb-6 text-center">
//         Add your website and social links so people can find you more easily.
//         WhatsApp is required so customers can contact you directly.
//       </p>

//       <div className="space-y-4 mb-4">
//         <div>
//           <label className="block text-sm mb-1">Website</label>
//           <input
//             type="url"
//             placeholder="https://your-website.com"
//             value={website}
//             onChange={(e) => setWebsite(e.target.value)}
//             className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
//           />
//         </div>

//         <div>
//           <label className="block text-sm mb-1">Facebook Page</label>
//           <input
//             type="url"
//             placeholder="https://facebook.com/yourpage"
//             value={facebook}
//             onChange={(e) => setFacebook(e.target.value)}
//             className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
//           />
//         </div>

//         <div>
//           <label className="block text-sm mb-1">Instagram</label>
//           <input
//             type="url"
//             placeholder="https://instagram.com/youraccount"
//             value={instagram}
//             onChange={(e) => setInstagram(e.target.value)}
//             className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
//           />
//         </div>

//         <div>
//           <label className="block text-sm mb-1">TikTok</label>
//           <input
//             type="url"
//             placeholder="https://www.tiktok.com/@youraccount"
//             value={tiktok}
//             onChange={(e) => setTiktok(e.target.value)}
//             className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
//           />
//         </div>

//         <div>
//           <label className="block text-sm mb-1">
//             WhatsApp (link or phone) *
//           </label>
//           <input
//             type="text"
//             placeholder="Ex: +33 6 12 34 56 78 or https://wa.me/..."
//             value={whatsapp}
//             onChange={(e) => setWhatsapp(e.target.value)}
//             className={`w-full px-4 py-3 rounded-xl border ${
//               !whatsapp && error
//                 ? "border-red-300 bg-red-500/20"
//                 : "border-white/30 bg-white/20"
//             } text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50`}
//           />
//         </div>
//       </div>

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
//           onClick={handleContinue}
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

type Step5Props = {
  whatsapp: string;
  setWhatsapp: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  website: string;
  setWebsite: (value: string) => void;
  instagram: string;
  setInstagram: (value: string) => void;
  facebook: string;
  setFacebook: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function Step5({
  whatsapp,
  setWhatsapp,
  phone,
  setPhone,
  email,
  setEmail,
  website,
  setWebsite,
  instagram,
  setInstagram,
  facebook,
  setFacebook,
  onBack,
  onNext,
}: Step5Props) {
  const [error, setError] = useState<string | null>(null);

  function handleNext() {
    if (!whatsapp.trim()) {
      setError("WhatsApp is required. (Numéro WhatsApp obligatoire)");
      return;
    }
    setError(null);
    onNext();
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-center">
        Contact & Social (Contact & Réseaux)
      </h2>

      <p className="text-sm text-white/80 mb-6 text-center">
        Provide the contact information customers will use to reach you.
        <br />
        <span className="text-white/70">
          (Indiquez les informations de contact pour que les clients puissent
          vous joindre.)
        </span>
      </p>

      {/* WhatsApp (required) */}
      <label className="block text-sm mb-1">
        WhatsApp number or link  *
      </label>
      <input
        type="text"
        placeholder="Ex: +352 621 000000 / https://wa.me/352621000000"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        className={`w-full px-4 py-3 rounded-xl border text-sm sm:text-base
          ${
            !whatsapp && error
              ? "border-red-300 bg-red-500/20"
              : "border-white/30 bg-white/20"
          }
          text-white placeholder-white/60 mb-4
          focus:outline-none focus:ring-2 focus:ring-white/50`}
      />

      {/* Phone */}
      <label className="block text-sm mb-1">
        Phone number 
      </label>
      <input
        type="text"
        placeholder="Optional (Facultatif)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/60 mb-4 focus:outline-none focus:ring-2 focus:ring-white/50"
      />

      {/* Email */}
      <label className="block text-sm mb-1">Email</label>
      <input
        type="email"
        placeholder="Optional (Facultatif)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/60 mb-4 focus:outline-none focus:ring-2 focus:ring-white/50"
      />

      {/* Website */}
      <label className="block text-sm mb-1">
        Website 
      </label>
      <input
        type="text"
        placeholder="Optional (Facultatif)"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/60 mb-4 focus:outline-none focus:ring-2 focus:ring-white/50"
      />

      {/* Facebook */}
      <label className="block text-sm mb-1">
        Facebook page 
      </label>
      <input
        type="text"
        placeholder="Optional (Facultatif)"
        value={facebook}
        onChange={(e) => setFacebook(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/60 mb-4 focus:outline-none focus:ring-2 focus:ring-white/50"
      />

      {/* Instagram */}
      <label className="block text-sm mb-1">Instagram</label>
      <input
        type="text"
        placeholder="Optional"
        value={instagram}
        onChange={(e) => setInstagram(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/60 mb-6 focus:outline-none focus:ring-2 focus:ring-white/50"
      />

      {/* Error */}
      {error && (
        <p className="text-xs text-red-200 bg-red-500/20 border border-red-300/60 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {/* Buttons */}
      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-4 py-3 bg-white/20 border border-white/40 rounded-xl text-sm font-semibold hover:bg-white/25 transition-all"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex-1 px-4 py-3 bg-white text-red-600 font-bold rounded-xl text-sm sm:text-base hover:scale-[1.02] active:scale-[0.97] transition-all shadow-xl"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
