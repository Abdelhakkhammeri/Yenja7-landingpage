"use client";

import { useState } from "react";

const ALL_COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia",
  "Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Belgium",
  "Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil",
  "Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada",
  "Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros",
  "Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti",
  "Dominica","Dominican Republic","DR Congo","Ecuador","Egypt","El Salvador",
  "Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland",
  "France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Greenland",
  "Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland",
  "India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Ivory Coast","Jamaica",
  "Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon",
  "Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar",
  "Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico",
  "Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia",
  "Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea",
  "North Macedonia","Norway","Oman","Pakistan","Panama","Paraguay","Peru","Philippines",
  "Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saudi Arabia","Senegal",
  "Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Somalia",
  "South Africa","South Korea","Spain","Sri Lanka","Sudan","Sweden","Switzerland",
  "Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Tunisia","Turkey",
  "Turkmenistan","Uganda","Ukraine","United Arab Emirates","United Kingdom",
  "United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia",
  "Zimbabwe"
];

type OpeningDay = {
  open: string;
  close: string;
  closed: boolean;
};

type Step3Props = {
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
  openingHours: {
    monday: OpeningDay;
    tuesday: OpeningDay;
    wednesday: OpeningDay;
    thursday: OpeningDay;
    friday: OpeningDay;
    saturday: OpeningDay;
    sunday: OpeningDay;
  };
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
}: Step3Props) {
  const [error, setError] = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  // Whenever the user edits address fields, we reset lat/lon
  function markAddressChanged() {
    setLatitude(null);
    setLongitude(null);
  }

  function buildAddressString() {
    const parts = [street, postalCode, city, country]
      .map((p) => p?.trim())
      .filter(Boolean);
    return parts.join(", ");
  }

  function normalizeCountryName(name: string | undefined | null): string {
    if (!name) return "";
    const exact = ALL_COUNTRIES.find(
      (c) => c.toLowerCase() === name.toLowerCase()
    );
    return exact ?? name;
  }

  // Forward geocoding (address -> lat/lon), used in background on Continue
  async function geocodeAddressIfNeeded() {
    // If Locate Me already filled coords and user didn't edit address, don't override
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
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        address
      )}&addressdetails=1&limit=1`;

      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Geocode status ${res.status}`);
      }

      const results: any[] = await res.json();

      if (!results || results.length === 0) {
        setError(
          "We could not find the GPS position for this address. Please check it or try the 'Locate me' button."
        );
        throw new Error("No geocode results");
      }

      const r = results[0];
      setLatitude(parseFloat(r.lat));
      setLongitude(parseFloat(r.lon));
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
      await geocodeAddressIfNeeded();
      onNext();
    } catch {
      // error already shown
    }
  }

  // Reverse geocoding (lat/lon -> street/city/postcode/country)
  function handleUseLocation() {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not available on this device.");
      return;
    }

    setLocLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setLatitude(lat);
        setLongitude(lon);

        (async () => {
          try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
              lat
            )}&lon=${encodeURIComponent(lon)}&addressdetails=1`;

            const res = await fetch(url, {
              headers: {
                Accept: "application/json",
              },
            });

            if (!res.ok) {
              throw new Error(`Reverse geocode status ${res.status}`);
            }

            const data: any = await res.json();
            const addr = data.address || {};

            const streetParts = [
              addr.road,
              addr.house_number,
              addr.pedestrian,
              addr.suburb,
            ].filter(Boolean);

            if (streetParts.length) {
              setStreet(streetParts.join(" "));
            }
            if (addr.city || addr.town || addr.village || addr.hamlet) {
              setCity(
                addr.city ||
                  addr.town ||
                  addr.village ||
                  addr.hamlet ||
                  ""
              );
            }
            if (addr.postcode) {
              setPostalCode(addr.postcode);
            }
            if (addr.country) {
              setCountry(normalizeCountryName(addr.country));
            }
          } catch (err) {
            console.error(err);
            setError(
              "We detected your position but could not resolve the address. Please check or fill it manually."
            );
          } finally {
            setLocLoading(false);
          }
        })();
      },
      (err) => {
        console.error(err);
        setError(
          "Could not get your location. Please try again or fill your address manually."
        );
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-center">
        Address & location
      </h2>

      <p className="text-sm text-white/80 text-center">
        Choose <span className="font-semibold">Locate me</span> or fill your
        address manually. We will detect the GPS position in the background.
        <br />
        <span className="text-white/70">
          (Choisissez &quot;Localiser mon commerce&quot; ou remplissez
          l&apos;adresse manuellement. La position GPS sera détectée
          automatiquement.)
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
              <span>Locate me</span>
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
          onChange={(e) => {
            markAddressChanged();
            setStreet(e.target.value);
          }}
          placeholder="Ex: 10 Rue de la Paix"
          className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
        />
      </div>

      {/* City + postal code */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">City (Ville) *</label>
          <input
            type="text"
            value={city}
            onChange={(e) => {
              markAddressChanged();
              setCity(e.target.value);
            }}
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
            onChange={(e) => {
              markAddressChanged();
              setPostalCode(e.target.value);
            }}
            placeholder="Ex: 75010"
            className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm mb-1">Country (Pays) *</label>
        <select
          value={country}
          onChange={(e) => {
            markAddressChanged();
            setCountry(e.target.value);
          }}
          className={`w-full px-4 py-3 rounded-xl border text-sm sm:text-base
            ${
              !country && error
                ? "border-red-300 bg-red-500/20"
                : "border-white/30"
            }
            bg-white text-black
            focus:outline-none focus:ring-2 focus:ring-white/50`}
        >
          <option value="">Select a country (Choisir un pays)</option>
          {ALL_COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-200 bg-red-500/20 border border-red-300/60 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    {/* DEBUG: Show coordinates */}
    {/* <div className="mt-4 p-3 rounded-xl bg-white/10 border border-white/20 text-xs text-white/80">
      <p className="font-semibold mb-1">📌 Debug info:</p>
      <p>Latitude: {latitude ?? "null"}</p>
      <p>Longitude: {longitude ?? "null"}</p>
    </div> */}
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
          className="flex-1 px-4 py-3 bg-white/20 border border-white/40 rounded-xl text-sm font-semibold hover:bg-white/25 transition-all disabled:opacity-60"
        >
          {geoLoading ? "Detecting position…" : "Continue (Continuer)"}
        </button>
      </div>
    </form>
  );
}
