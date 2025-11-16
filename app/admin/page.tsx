"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

type CategoryDetails = {
  halalMeat?: boolean | null;
  serveAlcohol?: boolean | null;
  hairType?: "men" | "women" | "both" | null;
  doctorSpecialties?: string | null;
};

type OpeningHours = {
  [day: string]: {
    open: string;
    close: string;
    closed?: boolean;
  };
};

type BusinessSubmission = {
  id: string;
  ownerId: string;
  category: string | null;
  categoryDetails?: CategoryDetails | null;

  // Normal businesses
  businessName?: string | null;
  description?: string | null;

  // Doctors / dentists
  doctorName?: string | null;
  doctorDiploma?: string | null;
  doctorRegistration?: string | null;
  doctorExtraInfo?: string | null;

  imageUrls?: string[];
  imagesCount?: number;
  status: string;
  createdAt?: Timestamp | null;

  // Location / address
  address?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;

  // Contact
  whatsapp?: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;

  openingHours?: OpeningHours | string | null;

  [key: string]: any;
};

type UserInfo = {
  fullName?: string;
  email?: string;
};

// Must match your Firestore rules
const ADMIN_UIDS = ["4eeQBixrSUO1mP3nF84K0AcnXEr2"];

type StatusFilter = "all" | "pending" | "approved" | "declined";

export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<BusinessSubmission[]>([]);
  const [userMap, setUserMap] = useState<Record<string, UserInfo>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAdmin(!!user && ADMIN_UIDS.includes(user.uid));
    });
    return () => unsub();
  }, []);

  // Load submissions when admin logged in
  useEffect(() => {
    if (!currentUser || !isAdmin) {
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "businessSubmissions"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);

        const docs: BusinessSubmission[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          docs.push({
            id: d.id,
            ...data,
          });
        });

        setSubmissions(docs);

        // Load owner user info (email + name)
        const ownerIds = Array.from(
          new Set(docs.map((s) => s.ownerId).filter(Boolean))
        );

        if (ownerIds.length > 0) {
          const entries: [string, UserInfo][] = await Promise.all(
            ownerIds.map(async (uid) => {
              try {
                const userDoc = await getDoc(doc(db, "users", uid));
                if (userDoc.exists()) {
                  const udata = userDoc.data() as any;
                  return [
                    uid,
                    {
                      fullName: udata.fullName ?? "",
                      email: udata.email ?? "",
                    },
                  ];
                }
              } catch (e) {
                console.error("Error loading user doc for", uid, e);
              }
              return [uid, {}];
            })
          );

          const map: Record<string, UserInfo> = {};
          for (const [uid, info] of entries) {
            map[uid] = info;
          }
          setUserMap(map);
        }
      } catch (err) {
        console.error("Error loading submissions", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [currentUser, isAdmin]);

  async function handleStatusChange(
    id: string,
    newStatus: "approved" | "declined"
  ) {
    if (!isAdmin) return;

    try {
      setUpdatingId(id + newStatus);
      const ref = doc(db, "businessSubmissions", id);
      await updateDoc(ref, { status: newStatus });

      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: newStatus,
              }
            : s
        )
      );
    } catch (err) {
      console.error("Error updating status", err);
      alert(
        `Could not update status.\n\n${
          (err as any)?.code ?? ""
        } ${(err as any)?.message ?? ""}`
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function formatDate(ts?: Timestamp | null) {
    if (!ts || typeof ts.toDate !== "function") return "-";
    const d = ts.toDate();
    return d.toLocaleString();
  }

  function renderStatusBadge(status: string) {
    const base =
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";
    if (status === "approved") {
      return (
        <span className={`${base} bg-emerald-100 text-emerald-700`}>
          Approved
        </span>
      );
    }
    if (status === "declined") {
      return (
        <span className={`${base} bg-rose-100 text-rose-700`}>Declined</span>
      );
    }
    return (
      <span className={`${base} bg-amber-100 text-amber-800`}>Pending</span>
    );
  }

  function renderOpeningHours(openingHours: OpeningHours | string | null) {
    if (!openingHours) return null;

    // If it's already a string, just show it
    if (typeof openingHours === "string") {
      return (
        <p className="text-xs sm:text-sm text-white/80 mt-1">{openingHours}</p>
      );
    }

    const entries = Object.entries(openingHours);
    if (entries.length === 0) return null;

    const order = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    const sorted = entries.sort(([a], [b]) => {
      const ia = order.indexOf(a.toLowerCase());
      const ib = order.indexOf(b.toLowerCase());
      if (ia === -1 || ib === -1) return a.localeCompare(b);
      return ia - ib;
    });

    return (
      <div className="mt-1 space-y-0.5 text-[11px] sm:text-xs text-white/80">
        {sorted.map(([day, info]) => {
          const d = info as any;
          if (d.closed) {
            return (
              <div key={day}>
                <span className="font-semibold capitalize">{day}:</span> Closed
              </div>
            );
          }
          return (
            <div key={day}>
              <span className="font-semibold capitalize">{day}:</span>{" "}
              {d.open} – {d.close}
            </div>
          );
        })}
      </div>
    );
  }

  // ---- DASHBOARD STATS ----
  const totalSubmissions = submissions.length;
  const approvedCount = submissions.filter(
    (s) => s.status === "approved"
  ).length;
  const declinedCount = submissions.filter(
    (s) => s.status === "declined"
  ).length;
  const pendingCount = submissions.filter(
    (s) => s.status !== "approved" && s.status !== "declined"
  ).length;

  const now = new Date();
  const sevenDaysAgo = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 7
  );

  const last7DaysCount = submissions.filter((s) => {
    if (!s.createdAt || typeof s.createdAt.toDate !== "function") return false;
    const d = s.createdAt.toDate();
    return d >= sevenDaysAgo;
  }).length;

  const filteredSubmissions = submissions.filter((s) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "approved") return s.status === "approved";
    if (statusFilter === "declined") return s.status === "declined";
    // pending
    return s.status !== "approved" && s.status !== "declined";
  });

  // ---- RENDER STATES ----

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
          <p className="text-sm text-white/80">Loading admin dashboard…</p>
        </div>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-3">Admin Dashboard</h1>
          <p className="text-sm text-white/80 mb-4">
            You are not logged in. Please log in with an admin account to
            access the dashboard.
          </p>
          <a
            href="/login"
            className="inline-block px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-sm"
          >
            Go to login
          </a>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-3">Yenja7 – Admin Dashboard</h1>
          <p className="text-sm text-red-200 font-semibold mb-4">
            Access denied.
          </p>
          <p className="text-sm text-white/70 mb-6">
            You are logged in as{" "}
            <span className="font-mono">{currentUser.email}</span>, but this
            account is not an admin.
          </p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-sm"
          >
            Back to homepage
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Gradient header */}
        <header className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 px-4 py-5 sm:px-6 sm:py-6 shadow-xl">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500/10 blur-2xl" />
          <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Yenja7 – Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-white/70">
                Review and approve business submissions from the landing page.
              </p>
            </div>
            <div className="text-xs text-right text-white/60">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Logged in as
              </div>
              <div className="font-mono text-white/80 break-all">
                {currentUser.email ?? currentUser.uid}
              </div>
            </div>
          </div>
        </header>

        {/* KPI cards */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-3 sm:px-4 sm:py-4 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-white/50">
              Total
            </div>
            <div className="mt-1 text-2xl font-bold">{totalSubmissions}</div>
            <p className="mt-1 text-[11px] text-white/60">All submissions</p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-3 py-3 sm:px-4 sm:py-4 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-amber-300/80">
              Pending
            </div>
            <div className="mt-1 text-2xl font-bold text-amber-200">
              {pendingCount}
            </div>
            <p className="mt-1 text-[11px] text-amber-200/80">
              Waiting for review
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-3 py-3 sm:px-4 sm:py-4 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-emerald-300/80">
              Approved
            </div>
            <div className="mt-1 text-2xl font-bold text-emerald-200">
              {approvedCount}
            </div>
            <p className="mt-1 text-[11px] text-emerald-200/80">
              Visible on map
            </p>
          </div>

          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 px-3 py-3 sm:px-4 sm:py-4 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-rose-300/80">
              Declined
            </div>
            <div className="mt-1 text-2xl font-bold text-rose-200">
              {declinedCount}
            </div>
            <p className="mt-1 text-[11px] text-rose-200/80">Need follow-up</p>
          </div>

          <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 px-3 py-3 sm:px-4 sm:py-4 shadow-sm col-span-2 sm:col-span-1">
            <div className="text-[11px] uppercase tracking-wide text-sky-300/80">
              Last 7 days
            </div>
            <div className="mt-1 text-2xl font-bold text-sky-200">
              {last7DaysCount}
            </div>
            <p className="mt-1 text-[11px] text-sky-200/80">
              New submissions
            </p>
          </div>
        </section>

        {/* Filter + list */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-semibold">Business submissions</h2>

            {/* Status filter pills – mobile friendly */}
            <div className="inline-flex items-center justify-start rounded-full bg-slate-900/80 border border-slate-800 p-1 text-xs w-full sm:w-auto">
              {[
                { id: "all", label: "All" },
                { id: "pending", label: "Pending" },
                { id: "approved", label: "Approved" },
                { id: "declined", label: "Declined" },
              ].map((opt) => {
                const active = statusFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStatusFilter(opt.id as StatusFilter)}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-full font-medium transition-all
                      ${
                        active
                          ? "bg-white text-slate-900 shadow"
                          : "text-white/70 hover:text-white"
                      }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <p className="text-sm text-white/70">
              {submissions.length === 0
                ? "No business submissions yet."
                : "No submissions for this filter."}
            </p>
          ) : (
            <div className="grid gap-4 md:gap-6">
              {filteredSubmissions.map((sub) => {
                const ownerInfo = userMap[sub.ownerId] ?? {};
                const isDoctor = sub.category === "doctor";
                const isDentist = sub.category === "dentist";
                const mainTitle =
                  (isDoctor || isDentist) && sub.doctorName
                    ? sub.doctorName
                    : sub.businessName || "(No name)";

                const street = sub.street ?? "";
                const address = sub.address ?? "";
                const city = sub.city ?? "";
                const pc = sub.postalCode ?? sub.zipCode ?? "";
                const country = sub.country ?? "";
                const fullAddress = [street, address, pc, city, country]
                  .filter(Boolean)
                  .join(", ");

                const hasContact =
                  sub.whatsapp ||
                  sub.phone ||
                  sub.email ||
                  sub.website ||
                  sub.instagram ||
                  sub.facebook;

                const hasCategoryDetails =
                  sub.categoryDetails?.halalMeat != null ||
                  sub.categoryDetails?.serveAlcohol != null ||
                  sub.categoryDetails?.hairType ||
                  sub.categoryDetails?.doctorSpecialties;

                return (
                  <div
                    key={sub.id}
                    className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 md:gap-5 shadow-sm"
                  >
                    {/* Left: main info */}
                    <div className="flex-1 space-y-4">
                      {/* Top row: title + status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h2 className="text-lg sm:text-xl font-semibold">
                            {mainTitle}
                          </h2>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-800 border border-slate-700 capitalize">
                              {sub.category ?? "Unknown category"}
                            </span>
                            {sub.categoryDetails?.doctorSpecialties && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-800 border border-slate-700">
                                {sub.categoryDetails.doctorSpecialties}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {renderStatusBadge(sub.status)}
                          <span className="text-[11px] text-white/50">
                            {formatDate(sub.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Business / Doctor info */}
                      <section className="space-y-1 text-xs sm:text-sm text-white/85">
                        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
                          Business / Doctor
                        </h3>

                        {(isDoctor || isDentist) && (
                          <>
                            {sub.doctorDiploma && (
                              <p>
                                <span className="font-semibold">
                                  Diploma (Diplôme) :
                                </span>{" "}
                                {sub.doctorDiploma}
                              </p>
                            )}
                            {sub.doctorRegistration && (
                              <p>
                                <span className="font-semibold">
                                  Registration (Numéro d&apos;ordre) :
                                </span>{" "}
                                {sub.doctorRegistration}
                              </p>
                            )}
                            {sub.doctorExtraInfo && (
                              <p>
                                <span className="font-semibold">
                                  Extra info (Infos patients) :
                                </span>{" "}
                                {sub.doctorExtraInfo}
                              </p>
                            )}
                          </>
                        )}

                        {!isDoctor && !isDentist && sub.description && (
                          <p>
                            <span className="font-semibold">Description :</span>{" "}
                            {sub.description}
                          </p>
                        )}

                        {!sub.description &&
                          !sub.doctorDiploma &&
                          !sub.doctorRegistration &&
                          !sub.doctorExtraInfo && (
                            <p className="text-white/50 text-xs">
                              No extra information provided.
                            </p>
                          )}
                      </section>

                      {/* Category details */}
                      {hasCategoryDetails && (
                        <section className="space-y-1 text-xs sm:text-sm text-white/85">
                          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
                            Category details
                          </h3>
                          {sub.categoryDetails?.halalMeat != null && (
                            <p>
                              <span className="font-semibold">
                                Halal meat :
                              </span>{" "}
                              {sub.categoryDetails.halalMeat ? "Yes" : "No"}
                            </p>
                          )}
                          {sub.categoryDetails?.serveAlcohol != null && (
                            <p>
                              <span className="font-semibold">
                                Serves alcohol :
                              </span>{" "}
                              {sub.categoryDetails.serveAlcohol ? "Yes" : "No"}
                            </p>
                          )}
                          {sub.categoryDetails?.hairType && (
                            <p>
                              <span className="font-semibold">
                                Hairdresser type :
                              </span>{" "}
                              {sub.categoryDetails.hairType}
                            </p>
                          )}
                          {sub.categoryDetails?.doctorSpecialties && (
                            <p>
                              <span className="font-semibold">Specialty :</span>{" "}
                              {sub.categoryDetails.doctorSpecialties}
                            </p>
                          )}
                        </section>
                      )}

                      {/* Address & location */}
                      {(fullAddress ||
                        sub.latitude ||
                        sub.longitude ||
                        sub.openingHours) && (
                        <section className="space-y-1 text-xs sm:text-sm text-white/85">
                          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
                            Address & Opening hours
                          </h3>

                          {fullAddress && (
                            <p>
                              <span className="font-semibold">Address :</span>{" "}
                              {fullAddress}
                            </p>
                          )}

                          {(sub.latitude || sub.longitude) && (
                            <p>
                              <span className="font-semibold">Location :</span>{" "}
                              {sub.latitude?.toFixed(5) ?? "?"},{" "}
                              {sub.longitude?.toFixed(5) ?? "?"}
                            </p>
                          )}

                          {renderOpeningHours(
                            (sub.openingHours as OpeningHours | string | null) ??
                              null
                          )}
                        </section>
                      )}

                      {/* Contact & social */}
                      {hasContact && (
                        <section className="space-y-1 text-xs sm:text-sm text-white/85">
                          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
                            Contact & Social
                          </h3>
                          {sub.whatsapp && (
                            <p>
                              <span className="font-semibold">WhatsApp :</span>{" "}
                              {sub.whatsapp}
                            </p>
                          )}
                          {sub.phone && (
                            <p>
                              <span className="font-semibold">Phone :</span>{" "}
                              {sub.phone}
                            </p>
                          )}
                          {sub.email && (
                            <p>
                              <span className="font-semibold">Email :</span>{" "}
                              <span className="font-mono">{sub.email}</span>
                            </p>
                          )}
                          {sub.website && (
                            <p>
                              <span className="font-semibold">Website :</span>{" "}
                              <a
                                href={sub.website}
                                target="_blank"
                                rel="noreferrer"
                                className="underline text-sky-300"
                              >
                                {sub.website}
                              </a>
                            </p>
                          )}
                          {sub.instagram && (
                            <p>
                              <span className="font-semibold">Instagram :</span>{" "}
                              <a
                                href={sub.instagram}
                                target="_blank"
                                rel="noreferrer"
                                className="underline text-pink-300"
                              >
                                {sub.instagram}
                              </a>
                            </p>
                          )}
                          {sub.facebook && (
                            <p>
                              <span className="font-semibold">Facebook :</span>{" "}
                              <a
                                href={sub.facebook}
                                target="_blank"
                                rel="noreferrer"
                                className="underline text-sky-300"
                              >
                                {sub.facebook}
                              </a>
                            </p>
                          )}
                        </section>
                      )}

                      {/* Owner info */}
                      <section className="mt-2 border-t border-slate-800 pt-2 text-[11px] text-white/60 space-y-0.5">
                        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
                          Owner
                        </h3>
                        <div className="flex flex-wrap items-center gap-3">
                          <span>
                            ID:{" "}
                            <span className="font-mono">{sub.ownerId}</span>
                          </span>
                          {ownerInfo.fullName && (
                            <span>
                              Name:{" "}
                              <span className="font-semibold">
                                {ownerInfo.fullName}
                              </span>
                            </span>
                          )}
                          {ownerInfo.email && (
                            <span>
                              Email:{" "}
                              <span className="font-mono">
                                {ownerInfo.email}
                              </span>
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[10px] text-white/40">
                          You can reply manually by email for feedback if
                          needed. (Répondez par email pour donner un retour, si
                          besoin.)
                        </p>
                      </section>
                    </div>

                    {/* Right: images + actions */}
                    <div className="w-full md:w-60 flex flex-col gap-3">
                      {/* All photos */}
                      {sub.imageUrls && sub.imageUrls.length > 0 ? (
                        <div className="space-y-1">
                          <div className="grid grid-cols-2 gap-2">
                            {sub.imageUrls.map((url, idx) => (
                              <div
                                key={url + idx}
                                className="relative w-full aspect-video bg-slate-800 rounded-xl overflow-hidden"
                              >
                                <img
                                  src={url}
                                  alt={`${
                                    mainTitle ?? "Business photo"
                                  } #${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-1 right-1 rounded-full bg-black/70 text-[10px] px-2 py-0.5 text-white/80">
                                  {idx + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                          <p className="text-[11px] text-white/60">
                            {sub.imageUrls.length} photo
                            {sub.imageUrls.length > 1 ? "s" : ""} uploaded
                          </p>
                        </div>
                      ) : (
                        <div className="w-full aspect-video bg-slate-800 rounded-xl flex items-center justify-center text-xs text-white/40">
                          No photo
                        </div>
                      )}

                      {/* Approve / Decline */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(sub.id, "approved")
                          }
                          disabled={
                            sub.status === "approved" ||
                            updatingId === sub.id + "approved"
                          }
                          className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold
                            ${
                              sub.status === "approved"
                                ? "bg-emerald-700/60 text-emerald-100 cursor-default"
                                : "bg-emerald-500 text-white hover:bg-emerald-600"
                            } disabled:opacity-60 disabled:cursor-not-allowed transition-all`}
                        >
                          {updatingId === sub.id + "approved"
                            ? "Approving…"
                            : sub.status === "approved"
                            ? "Approved"
                            : "Approve"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(sub.id, "declined")
                          }
                          disabled={
                            sub.status === "declined" ||
                            updatingId === sub.id + "declined"
                          }
                          className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold
                            ${
                              sub.status === "declined"
                                ? "bg-rose-700/60 text-rose-100 cursor-default"
                                : "bg-rose-500 text-white hover:bg-rose-600"
                            } disabled:opacity-60 disabled:cursor-not-allowed transition-all`}
                        >
                          {updatingId === sub.id + "declined"
                            ? "Declining…"
                            : sub.status === "declined"
                            ? "Declined"
                            : "Decline"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
