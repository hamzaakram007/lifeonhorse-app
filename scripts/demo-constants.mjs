/** Fixed demo UUIDs and curated Unsplash image URLs for staging only. */

export const DEMO_DOMAIN = "demo.lifeonhorse.com";
export const DEMO_PASSWORD = "DemoLifeOnHorse2026!";

export const USERS = {
  admin: { id: "d1111111-1111-4111-8111-111111111101", email: "admin@demo.lifeonhorse.com", full_name: "Demo Admin", role: "admin", country: "PK", city: "Lahore" },
  breeder: { id: "d1111111-1111-4111-8111-111111111102", email: "breeder@demo.lifeonhorse.com", full_name: "Aisha Khan", role: "seller", country: "PK", city: "Lahore" },
  tack: { id: "d1111111-1111-4111-8111-111111111103", email: "tack@demo.lifeonhorse.com", full_name: "Lahore Premier Tack", role: "seller", country: "PK", city: "Lahore" },
  feed: { id: "d1111111-1111-4111-8111-111111111104", email: "feed@demo.lifeonhorse.com", full_name: "Equine Nutrition Co", role: "seller", country: "IN", city: "Jaipur" },
  transport: { id: "d1111111-1111-4111-8111-111111111105", email: "transport@demo.lifeonhorse.com", full_name: "Global Horse Transport", role: "seller", country: "AE", city: "Dubai" },
  poloClub: { id: "d1111111-1111-4111-8111-111111111106", email: "polo@demo.lifeonhorse.com", full_name: "Royal Polo Club", role: "club_owner", country: "AR", city: "Buenos Aires" },
  tentPegging: { id: "d1111111-1111-4111-8111-111111111107", email: "tentpegging@demo.lifeonhorse.com", full_name: "Frontier Tent Pegging", role: "club_owner", country: "PK", city: "Multan" },
  trainer: { id: "d1111111-1111-4111-8111-111111111108", email: "trainer@demo.lifeonhorse.com", full_name: "Sarah Mitchell", role: "trainer", country: "GB", city: "Newmarket" },
  vet: { id: "d1111111-1111-4111-8111-111111111109", email: "vet@demo.lifeonhorse.com", full_name: "Dr. James Whitfield", role: "member", country: "GB", city: "London" },
  community: { id: "d1111111-1111-4111-8111-111111111110", email: "community@demo.lifeonhorse.com", full_name: "Emma Rodriguez", role: "member", country: "US", city: "Kentucky" },
};

export const IMG = {
  horse1: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5f?w=1200&q=80",
  horse2: "https://images.unsplash.com/photo-1509780119416-da3e42614916?w=1200&q=80",
  horse3: "https://images.unsplash.com/photo-1534303073046-fe4d962fe047?w=1200&q=80",
  horse4: "https://images.unsplash.com/photo-1568761982337-b269a64e8b44?w=1200&q=80",
  horse5: "https://images.unsplash.com/photo-1596272879289-2a0c9f0a0b0e?w=1200&q=80",
  polo: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1200&q=80",
  stable: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80",
  saddle: "https://images.unsplash.com/photo-1599059813005-11265ba93b20?w=1200&q=80",
  grooming: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d8?w=1200&q=80",
  riding: "https://images.unsplash.com/photo-1594751704318-1be2b8b8b8b8?w=1200&q=80",
  vet: "https://images.unsplash.com/photo-1628009368231-7bb7cfc4baf3?w=1200&q=80",
  event: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80",
  landscape: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
};

export const SELLERS = {
  tack: { id: "d3333333-3333-4333-8333-333333333301", user: "tack", name: "Lahore Premier Tack & Saddlery", verified: true },
  feed: { id: "d3333333-3333-4333-8333-333333333302", user: "feed", name: "Equine Nutrition India", verified: true },
  breeder: { id: "d3333333-3333-4333-8333-333333333303", user: "breeder", name: "Punjab Arabian Stud", verified: false },
  transport: { id: "d3333333-3333-4333-8333-333333333304", user: "transport", name: "Gulf Horse Logistics", verified: true },
  boutique: { id: "d3333333-3333-4333-8333-333333333305", user: "poloClub", name: "Royal Polo Club Shop", verified: false },
};

export const HORSES = [
  { id: "d2222222-2222-4222-8222-222222222201", owner: "breeder", title: "Majestic Arabian Mare — Lahore", breed: "Arabian", age: 6, gender: "Mare", price: 18500, currency: "USD", country: "PK", city: "Lahore", discipline: "Endurance", featured: true, photos: [IMG.horse1, IMG.horse2] },
  { id: "d2222222-2222-4222-8222-222222222202", owner: "breeder", title: "Thoroughbred Gelding — Newmarket", breed: "Thoroughbred", age: 8, gender: "Gelding", price: 22000, currency: "GBP", country: "GB", city: "Newmarket", discipline: "Racing", featured: false, photos: [IMG.horse3] },
  { id: "d2222222-2222-4222-8222-222222222203", owner: "breeder", title: "Akhal-Teke Stallion — Ashgabat", breed: "Akhal-Teke", age: 5, gender: "Stallion", price: 35000, currency: "USD", country: "TM", city: "Ashgabat", discipline: "Show", featured: true, photos: [IMG.horse4, IMG.horse1] },
  { id: "d2222222-2222-4222-8222-222222222204", owner: "breeder", title: "Marwari Mare — Rajasthan", breed: "Marwari", age: 7, gender: "Mare", price: 12000, currency: "INR", country: "IN", city: "Jaipur", discipline: "Traditional", featured: false, photos: [IMG.horse2] },
  { id: "d2222222-2222-4222-8222-222222222205", owner: "breeder", title: "Warmblood Sport Horse — Hanover", breed: "Warmblood", age: 9, gender: "Gelding", price: 28000, currency: "EUR", country: "DE", city: "Hanover", discipline: "Dressage", featured: false, photos: [IMG.horse5] },
  { id: "d2222222-2222-4222-8222-222222222206", owner: "breeder", title: "Quarter Horse — Kentucky", breed: "Quarter Horse", age: 4, gender: "Mare", price: 15000, currency: "USD", country: "US", city: "Lexington", discipline: "Western", featured: false, photos: [IMG.horse3, IMG.stable] },
  { id: "d2222222-2222-4222-8222-222222222207", owner: "poloClub", title: "Trained Polo Pony — Buenos Aires", breed: "Polo Pony", age: 6, gender: "Gelding", price: 32000, currency: "USD", country: "AR", city: "Buenos Aires", discipline: "Polo", featured: true, photos: [IMG.polo, IMG.horse1] },
  { id: "d2222222-2222-4222-8222-222222222208", owner: "breeder", title: "Rescue Adoption Horse — Cape Town", breed: "Crossbred", age: 10, gender: "Mare", price: 2500, currency: "ZAR", country: "ZA", city: "Cape Town", discipline: "Companion", listing_type: "adoption", featured: false, photos: [IMG.horse2, IMG.stable] },
];
