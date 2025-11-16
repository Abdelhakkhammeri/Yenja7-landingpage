"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Step1 from "./components/Step1";
import Step2 from "./components/Step2";
import Step3 from "./components/Step3";
import Step4 from "./components/Step4";
import Step5 from "./components/Step5";
import Step6 from "./components/Step6";
import Step4Details from "./components/Step4Details";
import imageCompression from "browser-image-compression";

import { auth, db, storage } from "../../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export type CategoryDetails = {
  halalMeat?: boolean | null;                 // restaurant / café
  serveAlcohol?: boolean | null;             // restaurant / café
  hairType?: "men" | "women" | "both" | null; // hairdresser
  doctorSpecialties?: string | null;         // doctor/dentist
};

export type OpeningHours = {
  [day: string]: {
    open: string;
    close: string;
    closed?: boolean;
  };
};

const isMedicalCategory = (cat: string | null) =>
  cat === "doctor" || cat === "dentist";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);

  const [category, setCategory] = useState<string | null>(null);
  const [categoryDetails, setCategoryDetails] =
    useState<CategoryDetails | null>(null);

  // Step 2 – normal business basics
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");

  // Step 2 – doctor/dentist
  const [doctorName, setDoctorName] = useState("");
  const [doctorDiploma, setDoctorDiploma] = useState("");
  const [doctorRegistration, setDoctorRegistration] = useState("");
  const [doctorExtraInfo, setDoctorExtraInfo] = useState("");

  // Step 3 – address & geo
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // Step 4 – opening hours
  const [openingHours, setOpeningHours] = useState<OpeningHours | null>(null);

  // Step 5 – contact & socials
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");

  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function nextStep() {
    setStep((s) => Math.min(s + 1, 6));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleFinish(files: File[]) {
    const user = auth.currentUser;
    if (!user) {
      alert("Your session expired. Please log in again.");
      return;
    }

    setSaving(true);

    try {
      // 🔧 Compression settings
      const options = {
        maxSizeMB: 0.7,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      };

      // 1) Compress images
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          if (file.size < 300 * 1024) return file;
          const compressed = await imageCompression(file, options);
          return compressed as File;
        })
      );

      // 2) Upload compressed images
      const uploadPromises = compressedFiles.map((file, index) => {
        const path = `businessSubmissions/${user.uid}/${Date.now()}_${index}_${file.name}`;
        const storageRef = ref(storage, path);
        return uploadBytes(storageRef, file).then((snapshot) =>
          getDownloadURL(snapshot.ref)
        );
      });

      const imageUrls = await Promise.all(uploadPromises);

      // 3) Save EVERYTHING to Firestore
      await addDoc(collection(db, "businessSubmissions"), {
        ownerId: user.uid,

        // Category info
        category: category ?? null,
        categoryDetails: categoryDetails ?? null,

        // Generic business info
        businessName: businessName || null,
        description: description || null,

        // Doctor / dentist info
        doctorName: doctorName || null,
        doctorDiploma: doctorDiploma || null,
        doctorRegistration: doctorRegistration || null,
        doctorExtraInfo: doctorExtraInfo || null,

        // Address & location
        street: street || null,
        address: street || null, // simple duplicate for now
        city: city || null,
        postalCode: postalCode || null,
        country: country || null,
        latitude: latitude,
        longitude: longitude,

        // Opening hours
        openingHours: openingHours ?? null,

        // Contact & socials
        whatsapp: whatsapp || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
        instagram: instagram || null,
        facebook: facebook || null,

        // Images
        imageUrls,
        imagesCount: imageUrls.length,

        status: "pending",
        createdAt: serverTimestamp(),
      });

      router.push("/my-business");
    } catch (err: any) {
      console.error("[handleFinish] ERROR:", err);
      alert(
        `Something went wrong while saving your business & photos.\n\n${
          err?.code ?? ""
        } ${err?.message ?? ""}`
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-red-700 text-white px-6 py-10">
      <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative">
        {saving && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center rounded-3xl z-20">
            <div className="h-8 w-8 rounded-full border-2 border-white border-t-transparent animate-spin mb-3" />
            <p className="text-sm text-white">Saving your business…</p>
          </div>
        )}

        {/* Header */}
        <h1 className="text-3xl font-extrabold text-center mb-6">
          Setup Your Business
        </h1>

        {/* Progress bar (6 steps) */}
        <div className="flex mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 mx-1 rounded-full ${
                i <= step ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>

        {/* Step 1 – select category */}
        {step === 1 && (
          <Step1
            onNext={(selectedCategory: string, details: CategoryDetails | null) => {
              setCategory(selectedCategory);
              setCategoryDetails(details);
              setStep(2);
            }}
            initialCategory={category}
            initialDetails={categoryDetails}
          />
        )}

        {/* Step 2 – either doctor details or business basics */}
        {step === 2 && (
          <>
            {isMedicalCategory(category) ? (
              <Step4Details
                category={category}
                businessName={businessName}
                setBusinessName={setBusinessName}
                description={description}
                setDescription={setDescription}
                doctorName={doctorName}
                setDoctorName={setDoctorName}
                doctorDiploma={doctorDiploma}
                setDoctorDiploma={setDoctorDiploma}
                doctorRegistration={doctorRegistration}
                setDoctorRegistration={setDoctorRegistration}
                doctorExtraInfo={doctorExtraInfo}
                setDoctorExtraInfo={setDoctorExtraInfo}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            ) : (
              <Step2
                businessName={businessName}
                setBusinessName={setBusinessName}
                description={description}
                setDescription={setDescription}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
          </>
        )}

        {/* Step 3 – address & location */}
        {step === 3 && (
          <Step3
            street={street}
            setStreet={setStreet}
            city={city}
            setCity={setCity}
            postalCode={postalCode}
            setPostalCode={setPostalCode}
            country={country}
            setCountry={setCountry}
            latitude={latitude}
            setLatitude={setLatitude}
            longitude={longitude}
            setLongitude={setLongitude}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {/* Step 4 – opening hours */}
        {step === 4 && (
          <Step4
            openingHours={openingHours}
            setOpeningHours={setOpeningHours}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {/* Step 5 – contact & socials */}
        {step === 5 && (
          <Step5
            whatsapp={whatsapp}
            setWhatsapp={setWhatsapp}
            phone={phone}
            setPhone={setPhone}
            email={email}
            setEmail={setEmail}
            website={website}
            setWebsite={setWebsite}
            instagram={instagram}
            setInstagram={setInstagram}
            facebook={facebook}
            setFacebook={setFacebook}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {/* Step 6 – photos + finish */}
        {step === 6 && (
          <Step6
            onBack={prevStep}
            onFinish={handleFinish}
          />
        )}
      </div>
    </main>
  );
}
