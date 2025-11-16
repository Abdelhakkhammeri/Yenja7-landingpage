// "use client";

// import { useState } from "react";

// type Step3Props = {
//   onBack: () => void;
//   onNext: () => void;
// };

// export default function Step3({ onBack, onNext }: Step3Props) {
//   const [country, setCountry] = useState("");
//   const [city, setCity] = useState("");
//   const [street, setStreet] = useState("");
//   const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
//     null
//   );
//   const [locLoading, setLocLoading] = useState(false);
//   const [locError, setLocError] = useState<string | null>(null);

//   async function handleDetectLocation() {
//     if (typeof navigator === "undefined" || !navigator.geolocation) {
//       setLocError("Geolocation is not supported in this browser.");
//       return;
//     }

//     setLocLoading(true);
//     setLocError(null);

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const { latitude, longitude } = position.coords;
//         setCoords({ lat: latitude, lon: longitude });

//         try {
//           const res = await fetch(
//             `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
//           );

//           if (!res.ok) {
//             throw new Error("Reverse geocoding failed");
//           }

//           const data = await res.json();
//           const addr = data.address || {};

//           const detectedCountry = addr.country || "";
//           const detectedCity =
//             addr.city || addr.town || addr.village || addr.hamlet || "";
//           const detectedStreet =
//             addr.road || addr.pedestrian || addr.suburb || "";

//           if (detectedCountry) setCountry(detectedCountry);
//           if (detectedCity) setCity(detectedCity);
//           if (detectedStreet) setStreet(detectedStreet);

//           if (!detectedCountry && !detectedCity) {
//             setLocError(
//               "We found your position, but couldn't detect city/country. Please fill manually."
//             );
//           }
//         } catch (err) {
//           console.error(err);
//           setLocError(
//             "We detected your position but could not resolve the address. Please fill manually."
//           );
//         } finally {
//           setLocLoading(false);
//         }
//       },
//       (error) => {
//         console.error(error);
//         setLocLoading(false);
//         if (error.code === error.PERMISSION_DENIED) {
//           setLocError(
//             "Location access was denied. You can fill your address manually."
//           );
//         } else {
//           setLocError(
//             "We couldn't get your location. Please try again or fill manually."
//           );
//         }
//       },
//       {
//         enableHighAccuracy: false,
//         timeout: 10000,
//         maximumAge: 60000,
//       }
//     );
//   }

//   function handleNext() {
//     // Later we can enforce at least city or country as required
//     if (!country && !city && !street) {
//       alert("Please fill at least city or country or street.");
//       return;
//     }
//     onNext();
//   }

//   return (
//     <div>
//       <h2 className="text-xl font-bold mb-4 text-center">
//         Where is your business located?
//       </h2>

//       <p className="text-sm text-white/80 mb-4 text-center">
//         Use your current location or fill your address manually.
//       </p>

//       {/* Auto-location button */}
//       <div className="mb-5 flex justify-center">
//         <button
//           type="button"
//           onClick={handleDetectLocation}
//           disabled={locLoading}
//           className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-red-600 text-sm font-semibold shadow-md hover:scale-[1.02] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
//         >
//           {locLoading ? (
//             <>
//               <span className="h-3 w-3 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
//               Detecting location…
//             </>
//           ) : (
//             <>
//               <span>📍</span>
//               <span>Use my current location</span>
//             </>
//           )}
//         </button>
//       </div>

//       {locError && (
//         <p className="mb-4 text-xs text-red-200 bg-red-500/20 border border-red-300/60 rounded-lg px-3 py-2">
//           {locError}
//         </p>
//       )}

//       {/* Country */}
//       <label className="block text-sm mb-1">Country</label>
//       <input
//         type="text"
//         placeholder="France, Belgium, Germany…"
//         value={country}
//         onChange={(e) => setCountry(e.target.value)}
//         className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/60 mb-4 focus:outline-none focus:ring-2 focus:ring-white/50"
//       />

//       {/* Street */}
//       <label className="block text-sm mb-1">Street / Address</label>
//       <input
//         type="text"
//         placeholder="Ex: 12 Rue de Paris"
//         value={street}
//         onChange={(e) => setStreet(e.target.value)}
//         className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/60 mb-4 focus:outline-none focus:ring-2 focus:ring-white/50"
//       />

//       {/* City */}
//       <label className="block text-sm mb-1">City</label>
//       <input
//         type="text"
//         placeholder="Paris, Brussels, Berlin…"
//         value={city}
//         onChange={(e) => setCity(e.target.value)}
//         className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/60 mb-6 focus:outline-none focus:ring-2 focus:ring-white/50"
//       />

//       {/* Optional coordinates display */}
//       {coords && (
//         <p className="mb-4 text-[11px] text-white/70">
//           Detected coordinates:{" "}
//           <span className="font-mono">
//             {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
//           </span>
//         </p>
//       )}

//       {/* Buttons */}
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

type Props = {
  street: string;
  setStreet: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  postalCode: string;
  setPostalCode: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  latitude: number | null;
  setLatitude: (v: number | null) => void;
  longitude: number | null;
  setLongitude: (v: number | null) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function Step3({
  street,
  setStreet,
  city,
  setCity,
  postalCode,
  setPostalCode,
  country,
  setCountry,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  onNext,
  onBack,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  function buildAddressString() {
    const parts = [street, postalCode, city, country]
      .map((p) => p?.trim())
      .filter(Boolean);
    return parts.join(", ");
  }

  // Called only in background when we click "Continue"
  async function geocodeAddressIfNeeded() {
    // If user already used "locate me", don't override
    if (latitude != null && longitude != null) return;

    const address = buildAddressString();
    if (!address) {
      setError(
        "Please enter at least city and country, or use your current location."
      );
      throw new Error("No address to geocode");
    }

    setGeoLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(address)}`);
      if (!res.ok) {
        throw new Error(`Geocode status ${res.status}`);
      }

      const results = await res.json();

      if (!results || results.length === 0) {
        setError(
          "We could not find the GPS position for this address. Please check it or try the 'Locate me' button."
        );
        throw new Error("No geocode results");
      }

      const { lat, lon } = results[0];
      setLatitude(parseFloat(lat));
      setLongitude(parseFloat(lon));
    } finally {
      setGeoLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!city.trim() || !country.trim()) {
      setError("City and country are required. (Ville et pays obligatoires)");
      return;
    }

    try {
      // 🔍 Background detection of latitude / longitude
      await geocodeAddressIfNeeded();
      onNext();
    } catch {
      // error already shown, we don't go to next step
    }
  }

  function handleUseLocation() {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not available on this device.");
      return;
    }

    setLocLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocLoading(false);
        // We *could* also reverse geocode here to fill street/city,
        // but we keep it simple for now.
      },
      (err) => {
        console.error(err);
        setError("Could not get your location. Please try again or fill your address manually.");
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-center">
        Address & location (Adresse & localisation)
      </h2>

      <p className="text-sm text-white/80 text-center">
        Choose{" "}
        <span className="font-semibold">Locate me</span> or fill your address
        manually. We will detect the GPS position in the background.
        <br />
        <span className="text-white/70">
          (Choisissez &quot;Localiser mon commerce&quot; ou remplissez l&apos;adresse
          manuellement. La position GPS sera détectée automatiquement.)
        </span>
      </p>

      {/* Locate me button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleUseLocation}
          disabled={locLoading || geoLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-red-600 text-sm font-semibold shadow-md hover:scale-[1.02] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {locLoading ? (
            <>
              <span className="h-3 w-3 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
              <span>Detecting location…</span>
            </>
          ) : (
            <>
              <span>📍</span>
              <span>Locate me (Localiser mon commerce)</span>
            </>
          )}
        </button>
      </div>

      <p className="text-center text-xs text-white/70">
        Or fill your address below. (Ou remplissez l&apos;adresse ci-dessous.)
      </p>

      {/* Street / address */}
      <div>
        <label className="block text-sm mb-1">
          Street / address (Rue / adresse)
        </label>
        <input
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="Ex: 10 Rue de la Paix"
          className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
        />
      </div>

      {/* City + postal code */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">
            City (Ville) *
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ex: Paris, Bruxelles, Berlin…"
            className={`w-full px-4 py-3 rounded-xl border text-sm sm:text-base
              ${
                !city && error
                  ? "border-red-300 bg-red-500/20"
                  : "border-white/30 bg-white/20"
              }
              text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50`}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">
            Postal code (Code postal)
          </label>
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="Ex: 75010"
            className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm mb-1">
          Country (Pays) *
        </label>
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Ex: France, Belgique, Allemagne…"
          className={`w-full px-4 py-3 rounded-xl border text-sm sm:text-base
            ${
              !country && error
                ? "border-red-300 bg-red-500/20"
                : "border-white/30 bg-white/20"
            }
            text-white placeholder-white/60
            focus:outline-none focus:ring-2 focus:ring-white/50`}
        />
      </div>

      {/* Error message */}
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
          disabled={geoLoading || locLoading}
          className="flex-1 px-4 py-3 bg-white text-red-600 font-bold rounded-xl text-sm sm:text-base hover:scale-[1.02] active:scale-[0.97] transition-all shadow-xl disabled:opacity-60"
        >
          {geoLoading ? "Detecting position…" : "Continue (Continuer)"}
        </button>
      </div>
    </form>
  );
}
