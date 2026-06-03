// data.jsx — mock listings + cities for Urbify

const CITIES = [
  { name: "Bangalore", count: 247, avgRent: "₹38k" },
  { name: "Mumbai",    count: 312, avgRent: "₹62k" },
  { name: "Delhi NCR", count: 198, avgRent: "₹41k" },
  { name: "Pune",      count: 156, avgRent: "₹32k" },
  { name: "Hyderabad", count: 142, avgRent: "₹29k" },
  { name: "Chennai",   count: 108, avgRent: "₹27k" },
];

const LOCALITIES = [
  "Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Jayanagar",
  "Bandra West", "Powai", "Andheri East", "Lower Parel", "Versova",
  "Gurugram Sector 56", "Hauz Khas", "Saket"
];

// real estate photos from unsplash
const PHOTOS = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80&auto=format&fit=crop",
];

const INTERIORS = [
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1600&q=80&auto=format&fit=crop",
];

const FURNISHING = ["Unfurnished", "Semi-furnished", "Fully furnished"];
const FACINGS = ["East", "West", "North", "South", "North-East", "South-East"];

const AMENITIES = [
  { id: "parking", label: "Parking" },
  { id: "lift",    label: "Lift" },
  { id: "gym",     label: "Gym" },
  { id: "pool",    label: "Pool" },
  { id: "security",label: "24/7 Security" },
  { id: "power",   label: "Power backup" },
  { id: "garden",  label: "Garden" },
  { id: "play",    label: "Kids play area" },
  { id: "petfr",   label: "Pet friendly" },
  { id: "wifi",    label: "Wi-Fi" },
];

function makeListing(i) {
  const bhk = (i % 4) + 1;
  const baseRent = [22, 32, 48, 72, 95][bhk - 1] || 38;
  const rentK = baseRent + ((i * 7) % 18);
  const photo = PHOTOS[i % PHOTOS.length];
  const locality = LOCALITIES[i % LOCALITIES.length];
  const city = i % 3 === 0 ? "Mumbai" : i % 3 === 1 ? "Bangalore" : "Pune";
  const area = 480 + ((i * 53) % 1200);
  const floor = (i % 14) + 1;
  const total = floor + ((i * 3) % 6) + 1;
  const furn = FURNISHING[i % 3];
  const facing = FACINGS[i % FACINGS.length];
  const isBroker = i % 4 === 0;
  const fee = Math.round((rentK * 1000 / 30) * 7.5);
  const feeGST = Math.round(fee * 1.18);

  return {
    id: `URB-${1000 + i}`,
    bhk,
    title: `${bhk} BHK ${bhk === 1 ? "Studio" : bhk >= 3 ? "Residence" : "Apartment"} in ${locality}`,
    locality, city,
    rentK, area, floor, total,
    furnishing: furn, facing,
    age: ["New", "<1 yr", "1-5 yr", "5-10 yr"][i % 4],
    available: ["Immediate", "1 Dec", "15 Dec", "1 Jan"][i % 4],
    photo,
    photos: [photo, ...INTERIORS.slice(0, 4)],
    isBroker,
    listedBy: isBroker ? `Verified Broker · RERA MH${20000 + i}` : "Direct Owner",
    amenities: AMENITIES.filter((_, k) => (k + i) % 3 !== 0).slice(0, 6).map(a => a.id),
    fee, feeGST,
    deposit: rentK * 2,
    posted: ["2h ago", "Today", "Yesterday", "3 days ago", "1 week ago"][i % 5],
    isNew: i % 5 === 0,
    pop: 40 + ((i * 11) % 60),
  };
}

const LISTINGS = Array.from({ length: 18 }, (_, i) => makeListing(i));

Object.assign(window, { CITIES, LOCALITIES, PHOTOS, INTERIORS, FURNISHING, FACINGS, AMENITIES, LISTINGS });
