"use client";

type Step4DetailsProps = {
  category: string | null;

  // For normal businesses
  businessName: string;
  setBusinessName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;

  // For doctors / dentists
  doctorName: string;
  setDoctorName: (v: string) => void;
  doctorDiploma: string;
  setDoctorDiploma: (v: string) => void;
  doctorRegistration: string;
  setDoctorRegistration: (v: string) => void;
  doctorExtraInfo: string;
  setDoctorExtraInfo: (v: string) => void;

  onNext: () => void;
  onBack: () => void;
};

export default function Step4Details(props: Step4DetailsProps) {
  const {
    category,
    businessName,
    setBusinessName,
    description,
    setDescription,
    doctorName,
    setDoctorName,
    doctorDiploma,
    setDoctorDiploma,
    doctorRegistration,
    setDoctorRegistration,
    doctorExtraInfo,
    setDoctorExtraInfo,
    onNext,
    onBack,
  } = props;

  const isMedical = category === "doctor" || category === "dentist";

  function handleNext() {
    if (isMedical) {
      if (!doctorName.trim()) {
        alert("Please enter the doctor's full name. (Nom complet du médecin)");
        return;
      }
      if (!doctorDiploma.trim()) {
        alert("Please enter at least one diploma. (Diplôme / études)");
        return;
      }
    } else {
      if (!businessName.trim()) {
        alert("Please enter a business name. (Nom du commerce)");
        return;
      }
    }

    onNext();
  }

  return (
    <div>
      {/* Title + intro text – same structure as other steps */}
      <h2 className="text-2xl font-bold text-white mb-2">
        {isMedical
          ? "Doctor / Dentist details (Informations médecin / dentiste)"
          : "Business details (Détails du commerce)"}
      </h2>

      <p className="text-sm text-white/80 mb-6">
        {isMedical
          ? "Give clear information that will help users choose the right doctor. (Donnez des informations claires pour aider les utilisateurs à choisir le bon médecin.)"
          : "Tell us how your business will appear on Yenja7. (Indiquez comment votre commerce apparaîtra sur Yenja7.)"}
      </p>

      {/* Content card */}
      <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 text-gray-900">
        {isMedical ? (
          <div className="space-y-5">
            {/* Doctor name */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Doctor&apos;s full name (Nom complet du médecin) *
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Dr. Ahmed Ben Salah"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
              />
            </div>

            {/* Diploma / studies */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Diploma / medical studies (Diplôme / études de médecine) *
              </label>
              <textarea
                value={doctorDiploma}
                onChange={(e) => setDoctorDiploma(e.target.value)}
                placeholder="Ex: Doctorat en médecine – Université de Tunis, Spécialisation en cardiologie..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none min-h-[80px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will reassure patients. (Cela rassure les patients.)
              </p>
            </div>

            {/* Registration number */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Professional registration number (Numéro d&apos;inscription / ordre)
              </label>
              <input
                type="text"
                value={doctorRegistration}
                onChange={(e) => setDoctorRegistration(e.target.value)}
                placeholder="Ex: Ordre des médecins n° 12345"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional but useful for trust. (Optionnel mais utile pour la
                confiance.)
              </p>
            </div>

            {/* Extra info */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Useful info for patients (Infos utiles pour les patients)
              </label>
              <textarea
                value={doctorExtraInfo}
                onChange={(e) => setDoctorExtraInfo(e.target.value)}
                placeholder="Ex: Langues parlées, enfants acceptés, téléconsultation, accès PMR..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none min-h-[80px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: languages, children welcome, online consultation, etc.{" "}
                (Exemple : langues parlées, enfants acceptés, téléconsultation,
                etc.)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Business name (for non-medical) */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Business name (Nom du commerce) *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ex: Tunis Market Paris"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
              />
            </div>

            {/* Description (for non-medical) */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Short description (Description courte)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Épicerie tunisienne avec produits frais, pains tunisiens, pâtisseries..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none min-h-[80px]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons – same style as other steps */}
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl border border-white/40 text-white text-sm font-medium hover:bg-white/10"
        >
          Back (Retour)
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-5 py-2.5 rounded-xl bg-white text-red-600 text-sm font-semibold shadow-md hover:scale-[1.02] active:scale-[0.97] transition-transform"
        >
          Next (Suivant)
        </button>
      </div>
    </div>
  );
}
