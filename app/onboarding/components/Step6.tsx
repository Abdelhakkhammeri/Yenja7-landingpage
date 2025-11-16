"use client";

import { useState } from "react";

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) {
      setError("Please select image files only (JPEG, PNG, etc.).");
      return;
    }

    const combined = [...images.map((img) => img.file), ...imageFiles];
    const limited = combined.slice(0, MAX_IMAGES);

    // Clean old URLs
    images.forEach((img) => URL.revokeObjectURL(img.url));

    const withUrls: SelectedImage[] = limited.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages(withUrls);

    if (combined.length > MAX_IMAGES) {
      setError(`You can upload up to ${MAX_IMAGES} images. Extra files were ignored.`);
    } else {
      setError(null);
    }

    e.target.value = "";
  }

  function handleRemoveImage(index: number) {
    setImages((prev) => {
      const copy = [...prev];
      const removed = copy.splice(index, 1)[0];
      if (removed) {
        URL.revokeObjectURL(removed.url);
      }
      return copy;
    });
  }

  function handleFinishClick() {
    // Later we’ll upload them; for now we just forward files to parent
    onFinish(images.map((img) => img.file));
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2 text-center">
        Add pictures of your business
      </h2>
      <p className="text-sm text-white/80 mb-6 text-center">
        You can upload up to {MAX_IMAGES} photos from your phone or computer.
        This helps customers recognize your place.
      </p>

      {/* Upload area */}
      <div className="mb-6">
        <label className="block text-sm mb-2">
          Business photos (front, inside, logo…)
        </label>

        <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-white/40 rounded-2xl px-4 py-10 bg-white/10 hover:bg-white/15 cursor-pointer transition-all">
          <span className="text-3xl mb-2">📷</span>
          <span className="text-sm font-semibold mb-1">
            Tap to choose photos
          </span>
          <span className="text-[11px] text-white/70 text-center">
            You can take new photos or choose them from your gallery
            (maximum {MAX_IMAGES} images).
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {error && (
        <p className="text-xs text-red-200 bg-red-500/20 border border-red-300/60 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {/* Previews */}
      {images.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-white/70 mb-2">
            Selected photos ({images.length}/{MAX_IMAGES}):
          </p>
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
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-black/60 rounded-full w-6 h-6 flex items-center justify-center text-xs text-white hover:bg-black/80"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 bg-white/20 border border-white/40 rounded-xl text-sm font-semibold hover:bg-white/25 transition-all"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleFinishClick}
          className="px-8 py-3 bg-white text-red-600 font-bold rounded-xl text-sm sm:text-base hover:scale-[1.02] active:scale-[0.97] transition-all shadow-xl"
        >
          Finish
        </button>
      </div>
    </div>
  );
}
