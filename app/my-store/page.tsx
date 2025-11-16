"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ⚠️ Adjust this to your Firebase file
import { auth, db } from "@/lib/firebase";

import {
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  type DocumentData,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

type OpeningDay = {
  open: string;
  close: string;
  closed?: boolean;
};

type Business = {
  id: string;
  businessName: string;
  category: string;
  description?: string | null;
  address?: string | null;
  street?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  status?: "pending" | "approved" | "rejected";
  imageUrls?: string[];
  openingHours?: {
    monday?: OpeningDay;
    tuesday?: OpeningDay;
    wednesday?: OpeningDay;
    thursday?: OpeningDay;
    friday?: OpeningDay;
    saturday?: OpeningDay;
    sunday?: OpeningDay;
  };
  ratingAverage?: number;
  ratingCount?: number;
};

function formatDay(day?: OpeningDay) {
  if (!day) return "Not set";
  if (day.closed) return "Closed / Fermé";
  if (!day.open || !day.close) return "Hours not complete";
  return `${day.open} – ${day.close}`;
}

export default function MyStorePage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [business, setBusiness] = useState<Business | null>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // edit mode / change request
  const [isEditing, setIsEditing] = useState(false);
  const [savingRequest, setSavingRequest] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    businessName: "",
    description: "",
    street: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
    whatsapp: "",
    website: "",
  });

  // Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingUser(false);
    });
    return () => unsub();
  }, []);

  // Load business (from businesses or fallback businessSubmissions)
  useEffect(() => {
    async function loadBusiness() {
      if (!user) {
        setBusiness(null);
        return;
      }

      setLoadingBusiness(true);
      setError(null);

      try {
        const collectionsToTry = ["businesses", "businessSubmissions"];
        let found: { id: string; data: DocumentData } | null = null;

        for (const colName of collectionsToTry) {
          const qRef = query(
            collection(db, colName),
            where("ownerId", "==", user.uid)
          );
          const snap = await getDocs(qRef);
          if (!snap.empty) {
            const doc = snap.docs[0];
            found = { id: doc.id, data: doc.data() };
            break;
          }
        }

        if (!found) {
          setBusiness(null);
        } else {
          const data = found.data;

          const b: Business = {
            id: found.id,
            businessName: data.businessName ?? "",
            category: data.category ?? "",
            description: data.description ?? null,
            address: data.address ?? null,
            street: data.street ?? null,
            city: data.city ?? null,
            postalCode: data.postalCode ?? null,
            country: data.country ?? null,
            phone: data.phone ?? null,
            email: data.email ?? null,
            whatsapp: data.whatsapp ?? null,
            website: data.website ?? null,
            facebook: data.facebook ?? null,
            instagram: data.instagram ?? null,
            status: data.status ?? "pending",
            imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
            openingHours: data.openingHours ?? {},
            ratingAverage: data.ratingAverage ?? 0,
            ratingCount: data.ratingCount ?? 0,
          };

          setBusiness(b);

          // pre-fill edit form
          setEditForm({
            businessName: b.businessName ?? "",
            description: b.description ?? "",
            street: b.street ?? "",
            city: b.city ?? "",
            postalCode: b.postalCode ?? "",
            country: b.country ?? "",
            phone: b.phone ?? "",
            whatsapp: b.whatsapp ?? "",
            website: b.website ?? "",
          });
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load your store. Please try again later.");
      } finally {
        setLoadingBusiness(false);
      }
    }

    loadBusiness();
  }, [user]);

  async function handleSubmitChangeRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !business) return;

    setRequestError(null);
    setRequestSuccess(null);

    // Build "changes" object: only fields that are different from original
    const changes: Record<string, any> = {};

    const fields: (keyof typeof editForm)[] = [
      "businessName",
      "description",
      "street",
      "city",
      "postalCode",
      "country",
      "phone",
      "whatsapp",
      "website",
    ];

    fields.forEach((field) => {
      const newVal = editForm[field] || "";
      let oldVal: string | null | undefined;

      if (field === "businessName") oldVal = business.businessName;
      else if (field === "description") oldVal = business.description;
      else if (field === "street") oldVal = business.street;
      else if (field === "city") oldVal = business.city;
      else if (field === "postalCode") oldVal = business.postalCode;
      else if (field === "country") oldVal = business.country;
      else if (field === "phone") oldVal = business.phone;
      else if (field === "whatsapp") oldVal = business.whatsapp;
      else if (field === "website") oldVal = business.website;

      if ((oldVal ?? "") !== newVal) {
        changes[field] = newVal === "" ? null : newVal;
      }
    });

    if (Object.keys(changes).length === 0) {
      setRequestError(
        "No changes detected. (Aucune modification détectée.)"
      );
      return;
    }

    try {
      setSavingRequest(true);

      await addDoc(collection(db, "businessChangeRequests"), {
        businessId: business.id,
        ownerId: user.uid,
        changes,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setRequestSuccess(
        "Your change request has been sent and will be reviewed by the team. (Votre demande de modification a été envoyée.)"
      );
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setRequestError(
        "Unable to send change request. Please try again later."
      );
    } finally {
      setSavingRequest(false);
    }
  }

  // ---------- UI states ----------

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-700 to-black text-white">
        <div className="flex flex-col items-center gap-3">
          <span className="h-6 w-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
          <p className="text-sm">Loading your account…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-700 to-black text-white px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold">My store (Mon commerce)</h1>
          <p className="text-sm text-white/80">
            You need to be logged in to see your store information.
            <br />
            (Vous devez être connecté pour voir les informations de votre
            commerce.)
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/login"
              className="px-5 py-3 rounded-xl bg-white text-red-600 text-sm font-semibold shadow-md hover:scale-[1.02] active:scale-[0.97] transition-all"
            >
              Go to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-700 to-black text-white px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">My store (Mon commerce)</h1>
            <p className="text-sm text-white/80">
              See and request changes for your business registered in Yenja7.
              <br />
              (Consultez et demandez des modifications pour votre commerce.)
            </p>
          </div>

          <Link
            href="/"
            className="text-xs px-3 py-2 rounded-xl bg-white/15 border border-white/30 hover:bg-white/20 transition-all"
          >
            ⬅ Back to landing
          </Link>
        </header>

        {loadingBusiness && (
          <div className="flex items-center gap-3 text-sm">
            <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            <span>Loading your store…</span>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-200 bg-red-500/20 border border-red-300/60 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {!loadingBusiness && !business && !error && (
          <div className="mt-4 rounded-2xl bg-white/10 border border-dashed border-white/40 px-4 py-5 text-sm">
            <p className="font-semibold mb-1">
              No store found for your account.
            </p>
            <p className="text-white/80 mb-3">
              It seems you haven&apos;t completed the business onboarding yet
              or your store is saved with another account.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-red-600 text-xs font-semibold shadow-md hover:scale-[1.02] active:scale-[0.97] transition-all"
            >
              🚀 Start onboarding (Ajouter mon commerce)
            </Link>
          </div>
        )}

        {business && (
          <div className="space-y-4">
            {/* Main store card */}
            <div className="rounded-2xl bg-white/10 border border-white/25 px-5 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-xl font-bold">
                    {business.businessName || "Unnamed business"}
                  </h2>
                  <p className="text-sm text-white/80">
                    {business.category}
                  </p>
                </div>

                <div className="flex flex-col items-start sm:items-end text-xs gap-1">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full border ${
                      business.status === "approved"
                        ? "border-green-300 bg-green-500/20 text-green-100"
                        : business.status === "pending"
                        ? "border-yellow-300 bg-yellow-500/20 text-yellow-100"
                        : "border-red-300 bg-red-500/20 text-red-100"
                    }`}
                  >
                    {business.status === "approved" && "Approved / Approuvé"}
                    {business.status === "pending" && "Pending / En attente"}
                    {business.status === "rejected" && "Rejected / Refusé"}
                  </span>

                  {business.ratingCount && business.ratingCount > 0 && (
                    <span className="text-white/70">
                      ⭐ {business.ratingAverage?.toFixed(1)} ·{" "}
                      {business.ratingCount} review
                      {business.ratingCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              {business.description && !isEditing && (
                <p className="text-sm text-white/80 mb-3">
                  {business.description}
                </p>
              )}

              {/* Address */}
              {!isEditing && (
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-white/80">Address</p>
                  <p className="text-white/90">
                    {business.street || business.address || "—"}
                    {business.postalCode || business.city ? (
                      <>
                        <br />
                        {business.postalCode} {business.city}
                      </>
                    ) : null}
                    {business.country ? (
                      <>
                        <br />
                        {business.country}
                      </>
                    ) : null}
                  </p>
                </div>
              )}
            </div>

            {/* Contact & links (read-only view) */}
            {!isEditing && (
              <div className="rounded-2xl bg-white/10 border border-white/25 px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-white/80">
                    Contact details (Contact)
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span>{" "}
                    {business.phone || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">WhatsApp:</span>{" "}
                    {business.whatsapp || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span>{" "}
                    {business.email || "—"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-semibold text-white/80">Online</p>
                  <p>
                    <span className="font-semibold">Website:</span>{" "}
                    {business.website ? (
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        {business.website}
                      </a>
                    ) : (
                      "—"
                    )}
                  </p>
                  <p>
                    <span className="font-semibold">Facebook:</span>{" "}
                    {business.facebook ? (
                      <a
                        href={business.facebook}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        {business.facebook}
                      </a>
                    ) : (
                      "—"
                    )}
                  </p>
                  <p>
                    <span className="font-semibold">Instagram:</span>{" "}
                    {business.instagram ? (
                      <a
                        href={business.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        {business.instagram}
                      </a>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Opening hours (read-only) */}
            {!isEditing && business.openingHours && (
              <div className="rounded-2xl bg-white/10 border border-white/25 px-5 py-4 text-xs">
                <p className="font-semibold text-white/80 mb-2">
                  Opening hours (Horaires)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <p className="font-semibold">Monday</p>
                    <p className="text-white/80">
                      {formatDay(business.openingHours.monday)}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Tuesday</p>
                    <p className="text-white/80">
                      {formatDay(business.openingHours.tuesday)}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Wednesday</p>
                    <p className="text-white/80">
                      {formatDay(business.openingHours.wednesday)}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Thursday</p>
                    <p className="text-white/80">
                      {formatDay(business.openingHours.thursday)}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Friday</p>
                    <p className="text-white/80">
                      {formatDay(business.openingHours.friday)}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Saturday</p>
                    <p className="text-white/80">
                      {formatDay(business.openingHours.saturday)}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Sunday</p>
                    <p className="text-white/80">
                      {formatDay(business.openingHours.sunday)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* EDIT FORM – change request */}
            {business && isEditing && (
              <form
                onSubmit={handleSubmitChangeRequest}
                className="rounded-2xl bg-white/10 border border-white/25 px-5 py-4 text-sm space-y-4"
              >
                <p className="font-semibold text-white/90">
                  Request changes (Demander une modification)
                </p>
                <p className="text-xs text-white/75">
                  Modify the fields below and submit. Your changes will be
                  reviewed by the Yenja7 team before being applied.
                  <br />
                  (Modifiez les champs ci-dessous. Les changements seront
                  validés par l&apos;équipe avant d&apos;être appliqués.)
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1">
                      Business name (Nom du commerce)
                    </label>
                    <input
                      type="text"
                      value={editForm.businessName}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          businessName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-white/40 bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-white/60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-1">
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl border border-white/40 bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-white/60"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs mb-1">
                        Street / address
                      </label>
                      <input
                        type="text"
                        value={editForm.street}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            street: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-white/40 bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-white/60"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={editForm.city}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            city: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-white/40 bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-white/60"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs mb-1">
                        Postal code
                      </label>
                      <input
                        type="text"
                        value={editForm.postalCode}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            postalCode: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-white/40 bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-white/60"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={editForm.country}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            country: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-white/40 bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-white/60"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            phone: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-white/40 bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-white/60"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">
                        WhatsApp
                      </label>
                      <input
                        type="text"
                        value={editForm.whatsapp}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            whatsapp: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-white/40 bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-white/60"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">
                        Website
                      </label>
                      <input
                        type="text"
                        value={editForm.website}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            website: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-white/40 bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-white/60"
                      />
                    </div>
                  </div>
                </div>

                {requestError && (
                  <p className="text-xs text-red-200 bg-red-500/20 border border-red-300/60 rounded-lg px-3 py-2">
                    {requestError}
                  </p>
                )}
                {requestSuccess && (
                  <p className="text-xs text-green-100 bg-green-500/20 border border-green-300/60 rounded-lg px-3 py-2">
                    {requestSuccess}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setRequestError(null);
                      setRequestSuccess(null);
                      // reset form to current business values
                      setEditForm({
                        businessName: business.businessName ?? "",
                        description: business.description ?? "",
                        street: business.street ?? "",
                        city: business.city ?? "",
                        postalCode: business.postalCode ?? "",
                        country: business.country ?? "",
                        phone: business.phone ?? "",
                        whatsapp: business.whatsapp ?? "",
                        website: business.website ?? "",
                      });
                    }}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/40 rounded-xl text-sm font-semibold text-center hover:bg-white/15 transition-all"
                  >
                    Cancel (Annuler)
                  </button>

                  <button
                    type="submit"
                    disabled={savingRequest}
                    className="flex-1 px-4 py-3 bg-white text-red-600 rounded-xl text-sm font-semibold shadow-md hover:scale-[1.02] active:scale-[0.97] transition-all disabled:opacity-60"
                  >
                    {savingRequest
                      ? "Sending…"
                      : "Send change request (Envoyer la demande)"}
                  </button>
                </div>
              </form>
            )}

            {/* Actions */}
            {!isEditing && (
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setRequestError(null);
                    setRequestSuccess(null);
                  }}
                  className="flex-1 px-4 py-3 bg-white text-red-600 rounded-xl text-sm font-semibold shadow-md hover:scale-[1.02] active:scale-[0.97] transition-all"
                >
                  Request changes (Demander une modification)
                </button>

                <Link
                  href="/onboarding"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/40 rounded-xl text-sm font-semibold text-center hover:bg-white/15 transition-all"
                >
                  Add another business (Ajouter un autre commerce)
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
