import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Missing lat or lon" },
      { status: 400 }
    );
  }

  // Simple Nominatim reverse geocoding
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lon)}&addressdetails=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Yenja7-Onboarding/1.0 (contact@yenja7.com)",
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Reverse geocoding failed" },
      { status: 500 }
    );
  }

  const data = await res.json();
  const addr = data.address || {};

  const streetParts = [
    addr.road,
    addr.house_number,
    addr.pedestrian,
    addr.suburb,
  ].filter(Boolean);

  return NextResponse.json({
    street: streetParts.join(" ") || null,
    city:
      addr.city ||
      addr.town ||
      addr.village ||
      addr.hamlet ||
      addr.municipality ||
      null,
    postalCode: addr.postcode || null,
    country: addr.country || null,
  });
}
