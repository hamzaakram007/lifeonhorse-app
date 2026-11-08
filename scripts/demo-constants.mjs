/** Fixed demo UUIDs and owned local image paths for staging only. */

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
  horse1: "/images/demo/horse-1.jpg",
  horse2: "/images/demo/horse-2.jpg",
  horse3: "/images/demo/horse-3.jpg",
  horse4: "/images/demo/horse-4.jpg",
  horse5: "/images/demo/horse-5.jpg",
  saddle: "/images/demo/product-saddle.jpg",
  bridle: "/images/demo/product-bridle.jpg",
  helmet: "/images/demo/product-helmet.jpg",
  feed: "/images/demo/product-feed.jpg",
  boots: "/images/demo/product-boots.jpg",
  grooming: "/images/demo/product-grooming.jpg",
  blanket: "/images/demo/product-blanket.jpg",
  mallet: "/images/demo/product-mallet.jpg",
  stableMat: "/images/demo/product-stable-mat.jpg",
  supplement: "/images/demo/product-supplement.jpg",
  apparel: "/images/demo/product-apparel.jpg",
  hoof: "/images/demo/product-hoof.jpg",
  product1: "/images/demo/product-1.jpg",
  service: "/images/demo/service-1.jpg",
  expert: "/images/demo/expert-1.jpg",
  // Clubs — unique covers
  clubPolo: "/images/demo/club-polo.jpg",
  clubTent: "/images/demo/club-tent.jpg",
  clubRiding: "/images/demo/club-riding.jpg",
  clubSports: "/images/demo/club-sports.jpg",
  clubCommunity: "/images/demo/club-community.jpg",
  clubRescue: "/images/demo/club-rescue.jpg",
  club1: "/images/demo/club-1.jpg",
  clubCape: "/images/demo/club-cape.jpg",
  clubBreeding: "/images/demo/club-breeding.jpg",
  clubHanover: "/images/demo/club-hanover.jpg",
  clubMumbai: "/images/demo/club-mumbai.jpg",
  clubCapePark: "/images/demo/club-cape-park.jpg",
  // Trainers — unique covers
  trainerDressage: "/images/demo/trainer-dressage.jpg",
  trainerPolo: "/images/demo/trainer-polo.jpg",
  trainerTent: "/images/demo/trainer-tent.jpg",
  trainerVet: "/images/demo/trainer-vet.jpg",
  trainerArabian: "/images/demo/trainer-arabian.jpg",
  trainerEventing: "/images/demo/trainer-eventing.jpg",
  trainer1: "/images/demo/trainer-1.jpg",
  // Events — unique covers
  eventPolo: "/images/demo/event-polo.jpg",
  eventTent: "/images/demo/event-tent.jpg",
  eventClinic: "/images/demo/event-clinic.jpg",
  eventAuction: "/images/demo/event-auction.jpg",
  eventTrail: "/images/demo/event-trail.jpg",
  eventHealth: "/images/demo/event-health.jpg",
  event1: "/images/demo/event-1.jpg",
  // Courses — unique covers
  courseDressage: "/images/demo/course-dressage.jpg",
  courseArabian: "/images/demo/course-arabian.jpg",
  courseFirstaid: "/images/demo/course-firstaid.jpg",
  coursePolo: "/images/demo/course-polo.jpg",
  courseNutrition: "/images/demo/course-nutrition.jpg",
  courseTent: "/images/demo/course-tent.jpg",
  course1: "/images/demo/course-1.jpg",
  // Legacy aliases (prefer unique keys above for new rows)
  polo: "/images/demo/event-polo.jpg",
  stable: "/images/demo/club-1.jpg",
  riding: "/images/demo/trainer-dressage.jpg",
  vet: "/images/demo/trainer-vet.jpg",
  event: "/images/demo/event-1.jpg",
  landscape: "/images/demo/club-community.jpg",
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
  { id: "d2222222-2222-4222-8222-222222222209", owner: "breeder", title: "Lusitano Stallion — Lisbon", breed: "Lusitano", age: 7, gender: "Stallion", price: 42000, currency: "EUR", country: "PT", city: "Lisbon", discipline: "Dressage", featured: true, photos: [IMG.horse4, IMG.stable] },
  { id: "d2222222-2222-4222-8222-222222222210", owner: "breeder", title: "Appaloosa Mare — Montana", breed: "Appaloosa", age: 5, gender: "Mare", price: 14000, currency: "USD", country: "US", city: "Montana", discipline: "Trail", featured: false, photos: [IMG.horse3] },
  { id: "d2222222-2222-4222-8222-222222222211", owner: "breeder", title: "Shire Draft — Yorkshire", breed: "Shire", age: 8, gender: "Gelding", price: 18000, currency: "GBP", country: "GB", city: "York", discipline: "Driving", featured: false, photos: [IMG.horse1, IMG.stable] },
  { id: "d2222222-2222-4222-8222-222222222212", owner: "poloClub", title: "Championship Polo String — Dubai", breed: "Thoroughbred Cross", age: 5, gender: "Gelding", price: 45000, currency: "AED", country: "AE", city: "Dubai", discipline: "Polo", featured: true, photos: [IMG.polo, IMG.horse2] },
  { id: "d2222222-2222-4222-8222-222222222213", owner: "breeder", title: "Criollo Mare — Mendoza", breed: "Criollo", age: 6, gender: "Mare", price: 9500, currency: "USD", country: "AR", city: "Mendoza", discipline: "Endurance", featured: false, photos: [IMG.horse2] },
  { id: "d2222222-2222-4222-8222-222222222214", owner: "breeder", title: "Hanoverian Filly — Verden", breed: "Hanoverian", age: 3, gender: "Filly", price: 38000, currency: "EUR", country: "DE", city: "Verden", discipline: "Show Jumping", featured: true, photos: [IMG.horse5, IMG.horse1] },
  { id: "d2222222-2222-4222-8222-222222222215", owner: "breeder", title: "Barb Stallion — Rabat", breed: "Barb", age: 9, gender: "Stallion", price: 22000, currency: "USD", country: "MA", city: "Rabat", discipline: "Traditional", featured: false, photos: [IMG.horse4] },
];

export const CLUBS = [
  { id: "d4444444-4444-4444-8444-444444444401", owner: "poloClub", name: "Royal Polo Club Buenos Aires", description: "Argentina's most prestigious polo club with 80+ ponies and international tournaments.", club_type: "polo", country: "AR", city: "Buenos Aires", logo_url: IMG.clubPolo, photos: [IMG.clubPolo, IMG.club1], member_count: 200, featured: true, verified: true },
  { id: "d4444444-4444-4444-8444-444444444402", owner: "tentPegging", name: "Frontier Tent Pegging Club", description: "Home of Pakistan's finest tent pegging riders and national champions.", club_type: "tent_pegging", country: "PK", city: "Multan", logo_url: IMG.clubTent, photos: [IMG.clubTent], member_count: 150, featured: true, verified: true },
  { id: "d4444444-4444-4444-8444-444444444403", owner: "trainer", name: "Newmarket Riding Academy", description: "Elite dressage and eventing training on the historic Newmarket gallops.", club_type: "riding_school", country: "GB", city: "Newmarket", logo_url: IMG.clubRiding, photos: [IMG.clubRiding], member_count: 95, featured: true, verified: true },
  { id: "d4444444-4444-4444-8444-444444444404", owner: "breeder", name: "Lahore Equestrian Centre", description: "Premier riding school and livery in Punjab with indoor arena.", club_type: "riding_school", country: "PK", city: "Lahore", logo_url: IMG.clubSports, photos: [IMG.clubSports], member_count: 120, featured: false, verified: true },
  { id: "d4444444-4444-4444-8444-444444444405", owner: "community", name: "Kentucky Horse Park Community", description: "Trail riding, clinics, and community events in the heart of horse country.", club_type: "general", country: "US", city: "Lexington", logo_url: IMG.clubCommunity, photos: [IMG.clubCommunity], member_count: 300, featured: true, verified: false },
  { id: "d4444444-4444-4444-8444-444444444406", owner: "vet", name: "Cape Equine Rescue", description: "Non-profit rescue and rehabilitation for horses in need across the Western Cape.", club_type: "rescue", country: "ZA", city: "Cape Town", logo_url: IMG.clubRescue, photos: [IMG.clubRescue], member_count: 45, featured: false, verified: true },
];

export const TRAINERS = [
  { id: "d5555555-5555-4555-8555-555555555501", user: "trainer", display_name: "Sarah Mitchell", specialty: "Dressage", description: "FEI-level dressage coach with 20 years experience training to Grand Prix.", country: "GB", city: "Newmarket", experience_years: 20, photos: [IMG.trainerDressage], featured: true, verified: true },
  { id: "d5555555-5555-4555-8555-555555555502", user: "poloClub", display_name: "Carlos Mendez", specialty: "Polo", description: "Former Argentine Open player coaching high-goal polo worldwide.", country: "AR", city: "Buenos Aires", experience_years: 18, photos: [IMG.trainerPolo], featured: true, verified: true },
  { id: "d5555555-5555-4555-8555-555555555503", user: "tentPegging", display_name: "Hassan Raza", specialty: "Tent Pegging", description: "National tent pegging champion coaching precision and speed.", country: "PK", city: "Multan", experience_years: 15, photos: [IMG.trainerTent], featured: true, verified: true },
  { id: "d5555555-5555-4555-8555-555555555504", user: "vet", display_name: "Dr. James Whitfield", specialty: "Veterinary", description: "Specialist in sport horse lameness and pre-purchase exams.", country: "GB", city: "London", experience_years: 22, photos: [IMG.trainerVet], featured: true, verified: true },
  { id: "d5555555-5555-4555-8555-555555555505", user: "breeder", display_name: "Aisha Khan", specialty: "Arabian", description: "Arabian horse training and showing across South Asia.", country: "PK", city: "Lahore", experience_years: 12, photos: [IMG.trainerArabian], featured: false, verified: true },
  { id: "d5555555-5555-4555-8555-555555555506", user: "community", display_name: "Emma Rodriguez", specialty: "Eventing", description: "CCI4* event rider coaching amateur and professional combinations.", country: "US", city: "Kentucky", experience_years: 16, photos: [IMG.trainerEventing], featured: true, verified: false },
];

export const PRODUCTS = [
  { id: "d6666666-6666-4666-8666-666666666601", seller: "tack", title: "Hand-Stitched Dressage Saddle", description: "Premium German leather dressage saddle, 17.5\" seat. Excellent condition — lightly used at shows only.", price: 4500, currency: "USD", category: "tack", country: "PK", photos: [IMG.saddle, IMG.product1], featured: true },
  { id: "d6666666-6666-4666-8666-666666666602", seller: "tack", title: "Polo Mallet Set — Pro Grade", description: "Set of 4 professional polo mallets with carbon shafts. Match-ready grip wrap.", price: 890, currency: "USD", category: "tack", country: "PK", photos: [IMG.mallet], featured: true },
  { id: "d6666666-6666-4666-8666-666666666603", seller: "feed", title: "Premium Alfalfa Cubes — 25kg", description: "High-protein alfalfa cubes for sport horses. New sealed bag.", price: 45, currency: "USD", category: "feed", country: "IN", photos: [IMG.feed], featured: false },
  { id: "d6666666-6666-4666-8666-666666666604", seller: "feed", title: "Electrolyte Supplement — 5kg", description: "Competition-grade electrolyte for hot climates. Tub with scoop included.", price: 120, currency: "USD", category: "feed", country: "IN", photos: [IMG.supplement], featured: false },
  { id: "d6666666-6666-4666-8666-666666666605", seller: "boutique", title: "Royal Polo Club Blazer", description: "Official club blazer with embroidered crest. Size 42R, like-new.", price: 350, currency: "USD", category: "apparel", country: "AR", photos: [IMG.apparel], featured: true },
  { id: "d6666666-6666-4666-8666-666666666606", seller: "tack", title: "Safety Riding Helmet — ASTM", description: "Certified helmet with ventilation and adjustable fit. New in box.", price: 280, currency: "USD", category: "tack", country: "PK", photos: [IMG.helmet], featured: false },
  { id: "d6666666-6666-4666-8666-666666666607", seller: "feed", title: "Mineral Salt Block — 20kg", description: "Essential minerals for pasture horses. Weather-resistant block.", price: 35, currency: "USD", category: "feed", country: "IN", photos: [IMG.feed], featured: false },
  { id: "d6666666-6666-4666-8666-666666666608", seller: "boutique", title: "Leather Polo Boots — Pair", description: "Hand-crafted polo boots with reinforced protection. Size 42, good used condition.", price: 520, currency: "USD", category: "tack", country: "AR", photos: [IMG.boots], featured: true },
  { id: "d6666666-6666-4666-8666-666666666609", seller: "tack", title: "Swedish Leather Bridle with Reins", description: "Anatomic flash bridle, soft leather, includes laced reins. Nearly new.", price: 185, currency: "USD", category: "tack", country: "PK", photos: [IMG.bridle], featured: true },
  { id: "d6666666-6666-4666-8666-666666666610", seller: "tack", title: "Turnout Blanket — Waterproof", description: "200g fill turnout rug with shoulder gussets. Size 6'3\", lightly used.", price: 160, currency: "USD", category: "apparel", country: "PK", photos: [IMG.blanket], featured: false },
  { id: "d6666666-6666-4666-8666-666666666611", seller: "breeder", title: "Deluxe Grooming Tote", description: "Eight-piece grooming set — body brush, curry, hoof pick, mane comb, and tote.", price: 75, currency: "USD", category: "grooming", country: "PK", photos: [IMG.grooming], featured: false },
  { id: "d6666666-6666-4666-8666-666666666612", seller: "boutique", title: "Interlocking Stall Mats — 4 Pack", description: "Heavy-duty rubber stall mats, 4× interlocking tiles for a standard box.", price: 320, currency: "USD", category: "stable", country: "AR", photos: [IMG.stableMat], featured: true },
  { id: "d6666666-6666-4666-8666-666666666613", seller: "feed", title: "Farrier Hoof Care Bundle", description: "Hoof oil, pick, and brush kit for weekly maintenance. New sealed.", price: 48, currency: "USD", category: "grooming", country: "IN", photos: [IMG.hoof], featured: false },
  { id: "d6666666-6666-4666-8666-666666666614", seller: "breeder", title: "Western Trail Saddle — Used", description: "Comfortable trail saddle, 16\" seat. Honest wear on fenders; tree sound.", price: 695, currency: "USD", category: "tack", country: "PK", photos: [IMG.saddle], featured: false },
  { id: "d6666666-6666-4666-8666-666666666615", seller: "tack", title: "Vented Jumping Helmet", description: "Lightweight ventilated helmet for arena and XC schooling. ASTM/SEI.", price: 210, currency: "USD", category: "tack", country: "PK", photos: [IMG.helmet], featured: false },
  { id: "d6666666-6666-4666-8666-666666666616", seller: "feed", title: "Timothy Hay Nets — Pair", description: "Slow-feed hay nets, large mesh. Pair for two stalls. New.", price: 28, currency: "USD", category: "feed", country: "IN", photos: [IMG.feed], featured: false },
];

export const SERVICES = [
  { id: "d7777777-7777-4777-8777-777777777701", seller: "transport", title: "International Horse Transport", description: "Door-to-door horse transport across GCC and Europe.", price: 5000, currency: "USD", category: "transport", country: "AE", photos: [IMG.stable], featured: true },
  { id: "d7777777-7777-4777-8777-777777777702", seller: "transport", title: "Domestic Air Freight — Horses", description: "Specialized air freight for competition horses.", price: 8000, currency: "USD", category: "transport", country: "AE", photos: [IMG.event], featured: true },
  { id: "d7777777-7777-4777-8777-777777777703", seller: "tack", title: "Mobile Farrier — Punjab", description: "Professional farrier service, per horse visit.", price: 75, currency: "USD", category: "farrier", country: "PK", photos: [IMG.grooming], featured: false },
  { id: "d7777777-7777-4777-8777-777777777704", seller: "breeder", title: "Equine Photography", description: "Professional sales photography for listings.", price: 350, currency: "USD", category: "photography", country: "PK", photos: [IMG.horse1], featured: true },
  { id: "d7777777-7777-4777-8777-777777777705", seller: "transport", title: "Stable Design Consultation", description: "Expert advice on world-class stable facilities.", price: 500, currency: "USD", category: "stable_management", country: "AE", photos: [IMG.stable], featured: false },
  { id: "d7777777-7777-4777-8777-777777777706", seller: "tack", title: "Saddle Fitting Service", description: "Certified saddle fitter for all disciplines.", price: 150, currency: "USD", category: "fitting", country: "PK", photos: [IMG.saddle], featured: false },
];

export const EVENTS = [
  { id: "d8888888-8888-4888-8888-888888888801", host: "poloClub", title: "Argentine Open Polo Cup 2026", description: "The world's most prestigious polo tournament.", event_type: "polo_match", country: "AR", city: "Buenos Aires", daysFromNow: 45, photos: [IMG.eventPolo], featured: true },
  { id: "d8888888-8888-4888-8888-888888888802", host: "tentPegging", title: "National Tent Pegging Championship", description: "Pakistan's premier tent pegging competition.", event_type: "competition", country: "PK", city: "Multan", daysFromNow: 30, photos: [IMG.eventTent], featured: true },
  { id: "d8888888-8888-4888-8888-888888888803", host: "trainer", title: "Dressage Masterclass — Newmarket", description: "Two-day clinic with international dressage judges.", event_type: "clinic", country: "GB", city: "Newmarket", daysFromNow: 60, photos: [IMG.eventClinic], featured: true },
  { id: "d8888888-8888-4888-8888-888888888804", host: "breeder", title: "Arabian Horse Auction — Lahore", description: "Premier Arabian horse auction with live bidding.", event_type: "auction", country: "PK", city: "Lahore", daysFromNow: 21, photos: [IMG.eventAuction], featured: true },
  { id: "d8888888-8888-4888-8888-888888888805", host: "community", title: "Kentucky Derby Week Trail Ride", description: "Scenic trail rides during Derby week festivities.", event_type: "trail_ride", country: "US", city: "Lexington", daysFromNow: 90, photos: [IMG.eventTrail], featured: false },
  { id: "d8888888-8888-4888-8888-888888888806", host: "vet", title: "Equine Health Symposium — London", description: "Leading vets discuss sport horse welfare and medicine.", event_type: "conference", country: "GB", city: "London", daysFromNow: 75, photos: [IMG.eventHealth], featured: false },
];

export const BLOG_POSTS = [
  { slug: "polo-heritage-argentina", title: "The Heritage of Argentine Polo", excerpt: "How Argentina became the spiritual home of high-goal polo.", content: "Argentina's polo tradition spans over a century of excellence. From the estancias of Buenos Aires province to the hallowed grounds of Palermo, the sport has produced legends whose names echo through history.\n\nThe combination of exceptional ponies, world-class players, and a culture that lives and breathes polo creates an ecosystem unmatched anywhere on earth.", category: "culture", author: "poloClub", cover: "/images/blog/blog-argentine-polo.jpg", featured: true },
  { slug: "tent-pegging-guide", title: "Tent Pegging: A Complete Guide", excerpt: "History, rules, and training for this thrilling equestrian sport.", content: "Tent pegging originated as cavalry training and evolved into a celebrated sport across South Asia and beyond. Riders gallop at full speed, sword in hand, to strike ground targets with precision.\n\nModern competition demands extraordinary horsemanship, courage, and split-second timing.", category: "guides", author: "tentPegging", cover: "/images/blog/blog-tent-pegging-guide.jpg", featured: true },
  { slug: "buying-arabian-horses", title: "Buying Arabian Horses: Expert Advice", excerpt: "What to look for in bloodlines, conformation, and temperament.", content: "The Arabian horse represents thousands of years of selective breeding. When purchasing, examine registration papers, evaluate conformation against breed standards, and always conduct a pre-purchase veterinary examination.\n\nTemperament testing is equally important — the best Arabians combine spirit with trainability.", category: "guides", author: "breeder", cover: "/images/blog/blog-buying-arabian.jpg", featured: true },
  { slug: "dressage-training-tips", title: "Dressage Training at Grand Prix Level", excerpt: "Insights from two decades of coaching at the highest level.", content: "Grand Prix dressage demands years of systematic training. Begin with correct basics — rhythm, suppleness, contact, impulsion, straightness, and collection build upon one another.\n\nPatience and consistency separate good riders from great ones.", category: "training", author: "trainer", cover: "/images/blog/blog-dressage-grand-prix.jpg", featured: false },
  { slug: "equine-nutrition-hot-climates", title: "Equine Nutrition in Hot Climates", excerpt: "Feeding strategies for horses in the Gulf and South Asia.", content: "Horses in hot climates face unique nutritional challenges. Electrolyte balance, hydration, and adjusted feeding schedules are critical during summer months.\n\nQuality forage remains the foundation of any feeding program.", category: "health", author: "feed", cover: "/images/blog/blog-nutrition-hot.jpg", featured: false },
  { slug: "horse-transport-safety", title: "International Horse Transport: Safety First", excerpt: "How professional transporters protect your horse across borders.", content: "International horse transport requires meticulous planning. Health certificates, quarantine protocols, and climate-controlled vehicles are non-negotiable.\n\nChoose transporters with proven track records and comprehensive insurance.", category: "guides", author: "transport", cover: "/images/blog/blog-horse-transport.jpg", featured: false },
  { slug: "kentucky-horse-culture", title: "Kentucky: Heart of American Horse Country", excerpt: "Exploring the bluegrass state's equestrian legacy.", content: "Kentucky's rolling bluegrass pastures have nurtured Thoroughbred champions for generations. From foaling barns to the iconic Churchill Downs, the state pulses with equine energy.\n\nThe Kentucky Horse Park stands as a monument to this enduring heritage.", category: "culture", author: "community", cover: "/images/blog/blog-kentucky-horse-country.jpg", featured: true },
  { slug: "vet-lameness-guide", title: "Understanding Equine Lameness", excerpt: "When to call the vet and what to expect during examination.", content: "Lameness is the most common reason horse owners seek veterinary care. Early detection through regular observation and prompt professional assessment can prevent minor issues from becoming career-ending.\n\nDiagnostic imaging has revolutionized our ability to pinpoint problems.", category: "health", author: "vet", cover: "/images/blog/blog-lameness.jpg", featured: false },
];

export const COURSES = [
  { id: "d9999999-9999-4999-8999-999999999901", creator: "trainer", title: "Dressage Fundamentals", description: "Master the basics of classical dressage training.", category: "training", cover: IMG.courseDressage, free: false, price: 199, currency: "USD", featured: true },
  { id: "d9999999-9999-4999-8999-999999999902", creator: "breeder", title: "Arabian Horse Conformation", description: "Evaluate Arabian horses for breeding and showing.", category: "breeding", cover: IMG.courseArabian, free: true, featured: true },
  { id: "d9999999-9999-4999-8999-999999999903", creator: "vet", title: "Equine First Aid Essentials", description: "Recognize emergencies and provide immediate care.", category: "health", cover: IMG.courseFirstaid, free: true, featured: false },
  { id: "d9999999-9999-4999-8999-999999999904", creator: "poloClub", title: "Introduction to Polo", description: "Rules, equipment, and beginner stick-and-ball drills.", category: "polo", cover: IMG.coursePolo, free: false, price: 149, currency: "USD", featured: true },
  { id: "d9999999-9999-4999-8999-999999999905", creator: "feed", title: "Equine Nutrition Masterclass", description: "Science-based feeding for performance horses.", category: "nutrition", cover: IMG.courseNutrition, free: false, price: 89, currency: "USD", featured: false },
  { id: "d9999999-9999-4999-8999-999999999906", creator: "tentPegging", title: "Tent Pegging Techniques", description: "Precision riding at speed — from basics to competition.", category: "training", cover: IMG.courseTent, free: false, price: 79, currency: "USD", featured: true },
];

export const COMMUNITY_POSTS = [
  { id: "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01", author: "community", title: "Derby week sunrise hack", content: "Nothing compares to riding through the misty bluegrass at dawn during Derby week. The whole landscape feels magical.", photos: [IMG.landscape, IMG.horse3] },
  { id: "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02", author: "poloClub", title: "Match day at Palermo", content: "8-goal final today. The atmosphere is electric — 15,000 fans and the finest ponies in the world.", photos: [IMG.polo] },
  { id: "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03", author: "tentPegging", title: "National trials complete", content: "Our team secured three gold medals at the national trials. Months of preparation paid off.", photos: [IMG.event, IMG.horse1] },
  { id: "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa04", author: "breeder", title: "New foal at the stud", content: "Welcome to the world, little champion. Arabian filly born this morning — mother and foal doing wonderfully.", photos: [IMG.horse2, IMG.stable] },
  { id: "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa05", author: "trainer", title: "Grand Prix debut success", content: "My student's Grand Prix debut scored 71% today. So proud of this partnership years in the making.", photos: [IMG.riding] },
  { id: "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa06", author: "vet", title: "Field clinic in rural Punjab", content: "Treated 40 horses at today's rural clinic. Vaccination and deworming programs making a real difference.", photos: [IMG.vet, IMG.horse1] },
  { id: "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa07", author: "transport", title: "Dubai to London — safe arrival", content: "Six competition horses arrived safely in Newmarket after a seamless Dubai-London transport.", photos: [IMG.stable] },
  { id: "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa08", author: "feed", title: "Nutrition workshop highlights", content: "Great turnout at our Jaipur nutrition workshop. Educating owners on proper feeding saves lives.", photos: [IMG.grooming] },
];

export const EXPERTS = [
  { id: "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01", user: "vet", display_name: "Dr. James Whitfield", specialty: "Equine Veterinarian", description: "Sport horse lameness specialist, 22 years experience.", country: "GB", city: "London", photos: [IMG.vet], featured: true, verified: true },
  { id: "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02", user: "trainer", display_name: "Sarah Mitchell", specialty: "Dressage Coach", description: "FEI dressage coach available for remote consultations.", country: "GB", city: "Newmarket", photos: [IMG.riding], featured: true, verified: true },
  { id: "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb03", user: "feed", display_name: "Dr. Priya Sharma", specialty: "Equine Nutritionist", description: "PhD in equine nutrition, specializing in performance horses.", country: "IN", city: "Jaipur", photos: [IMG.stable], featured: false, verified: true },
  { id: "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb04", user: "tack", display_name: "Ahmed Farooq", specialty: "Master Farrier", description: "Certified farrier serving elite stables across Punjab.", country: "PK", city: "Lahore", photos: [IMG.grooming], featured: false, verified: true },
  { id: "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb05", user: "poloClub", display_name: "Dr. Maria Santos", specialty: "Equine Dentist", description: "Specialized equine dental care for sport horses.", country: "AR", city: "Buenos Aires", photos: [IMG.vet], featured: false, verified: true },
  { id: "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb06", user: "transport", display_name: "Dr. Khalid Al-Rashid", specialty: "Equine Reproduction", description: "Leading reproduction specialist in the Gulf region.", country: "AE", city: "Dubai", photos: [IMG.horse1], featured: true, verified: true },
];

export const DEMO_USER_IDS = Object.values(USERS).map((u) => u.id);

export const DEMO_IDS = {
  horses: HORSES.map((h) => h.id),
  clubs: CLUBS.map((c) => c.id),
  trainers: TRAINERS.map((t) => t.id),
  sellers: Object.values(SELLERS).map((s) => s.id),
  products: PRODUCTS.map((p) => p.id),
  services: SERVICES.map((s) => s.id),
  events: EVENTS.map((e) => e.id),
  courses: COURSES.map((c) => c.id),
  blogSlugs: BLOG_POSTS.map((b) => b.slug),
  community: COMMUNITY_POSTS.map((c) => c.id),
  experts: EXPERTS.map((e) => e.id),
  healthRequests: ["dccccccc-cccc-4ccc-8ccc-cccccccccc01", "dccccccc-cccc-4ccc-8ccc-cccccccccc02", "dccccccc-cccc-4ccc-8ccc-cccccccccc03"],
};

