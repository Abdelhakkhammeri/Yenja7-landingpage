"use client";

import { useRef, useState } from "react";

type Step6Props = {
  onBack: () => void;
  onFinish: (files: File[]) => void;
};

type SelectedImage = {
  file: File;
  url: string;
};

const MAX_IMAGES = 6;

export default function Step6({ onBack, onFinish }: Step6Props) {
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const remainingSlots = MAX_IMAGES - images.length;

  function handleOpenPicker() {
    if (remainingSlots <= 0) {
      setError(`You can upload up to ${MAX_IMAGES} photos.`);
      return;
    }
    setError(null);
    fileInputRef.current?.click();
  }

  function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files) return;

    const newImages: SelectedImage[] = [];
    let available = remainingSlots;

    for (let i = 0; i < files.length && available > 0; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      newImages.push({
        file,
        url: URL.createObjectURL(file),
      });
      available--;
    }

    if (newImages.length === 0) {
      if (!error) setError("Please choose image files.");
      return;
    }

    setImages((prev) => [...prev, ...newImages]);
    // Reset value so selecting the same file again triggers onChange
    event.target.value = "";
  }

  function handleRemoveImage(url: string) {
    setImages((prev) => {
      prev.forEach((img) => {
        if (img.url === url) {
          URL.revokeObjectURL(img.url);
        }
      });
      return prev.filter((img) => img.url !== url);
    });
  }

  function handleFinishClick() {
    if (images.length === 0) {
      // You can allow 0 images if you want, or force at least 1
      // setError("Please upload at least one photo of your business.");
      // return;
    }
    onFinish(images.map((img) => img.file));
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-center">
        Add photos (Ajoutez des photos)
      </h2>

      <p className="text-sm text-white/80 text-center">
        Add up to {MAX_IMAGES} photos of your business (front, inside, menu,
        products…).
        <br />
        <span className="text-white/70">
          (Ajoutez jusqu&apos;à {MAX_IMAGES} photos de votre commerce.)
        </span>
      </p>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

      {/* Upload button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleOpenPicker}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-red-600 text-sm font-semibold shadow-md hover:scale-[1.02] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          disabled={remainingSlots <= 0}
        >
          <span>📷</span>
          <span>
            {remainingSlots > 0
              ? `Add photo (${remainingSlots} left)`
              : "Maximum photos reached"}
          </span>
        </button>
      </div>

      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, index) => (
            <div
              key={img.url}
              className="relative rounded-2xl overflow-hidden border border-white/30 bg-black/20"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={`Business ${index + 1}`}
                className="w-full h-28 sm:h-32 object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(img.url)}
                className="absolute top-1 right-1 rounded-full bg-black/70 text-white text-xs px-2 py-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-200 bg-red-500/20 border border-red-300/60 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Debug (optional, can remove later) */}
      <div className="mt-2 text-xs text-white/70">
        Selected files: {images.length} / {MAX_IMAGES}
      </div>

      {/* Buttons */}
      <div className="flex justify-between gap-3 mt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-4 py-3 bg-white/20 border border-white/40 rounded-xl text-sm font-semibold hover:bg-white/25 transition-all"
        >
          Back (Retour)
        </button>

        <button
          type="button"
          onClick={handleFinishClick}
          className="flex-1 px-4 py-3 bg-white/20 border border-white/40 rounded-xl text-sm font-semibold hover:bg-white/25 transition-all disabled:opacity-60"
        >
          Finish (Terminer)
        </button>
      </div>
    </div>
  );
}
