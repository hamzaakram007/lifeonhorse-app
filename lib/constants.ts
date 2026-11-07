export const BRAND_NAME = "LifeOnHorse";
export const BRAND_TAGLINE = "Your Global Horse Community";

export const LAUNCH_COUNTRIES = [
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "AZ", name: "Azerbaijan", flag: "🇦🇿" },
  { code: "TM", name: "Turkmenistan", flag: "🇹🇲" },
] as const;

export const USER_ROLES = [
  "member",
  "seller",
  "trainer",
  "club_owner",
  "course_creator",
  "moderator",
  "admin",
] as const;

export const LISTING_TYPES = [
  { value: "sale", label: "For Sale" },
  { value: "adoption", label: "Adoption" },
  { value: "stud", label: "Stud Service" },
  { value: "lease", label: "Lease" },
  { value: "wanted", label: "Wanted" },
] as const;

export const CLUB_TYPES = [
  { value: "polo", label: "Polo Club" },
  { value: "tent_pegging", label: "Tent Pegging" },
  { value: "racing", label: "Racing" },
  { value: "riding_school", label: "Riding School" },
  { value: "breeding", label: "Breeding Club" },
  { value: "equestrian_sports", label: "Equestrian Sports" },
  { value: "rescue", label: "Rescue / Sanctuary" },
  { value: "cultural", label: "Cultural / Traditional" },
  { value: "general", label: "General Community" },
  { value: "other", label: "Other" },
] as const;

export const TRAINER_TYPES = [
  { value: "riding", label: "Riding Instructor" },
  { value: "polo", label: "Polo Coach" },
  { value: "tent_pegging", label: "Tent Pegging Trainer" },
  { value: "vet", label: "Veterinarian" },
  { value: "farrier", label: "Farrier" },
  { value: "breeder", label: "Breeder" },
  { value: "diet", label: "Nutrition / Diet Expert" },
  { value: "stable_manager", label: "Stable Manager" },
  { value: "transport", label: "Transport / Import-Export" },
  { value: "other", label: "Other Expert" },
] as const;

export const EVENT_TYPES = [
  { value: "polo_match", label: "Polo Match" },
  { value: "tent_pegging", label: "Tent Pegging Competition" },
  { value: "horse_show", label: "Horse Show" },
  { value: "riding_camp", label: "Riding Camp" },
  { value: "workshop", label: "Workshop" },
  { value: "clinic", label: "Clinic" },
  { value: "competition", label: "Competition" },
  { value: "auction", label: "Auction" },
  { value: "trail_ride", label: "Trail Ride" },
  { value: "conference", label: "Conference" },
  { value: "club_meetup", label: "Club Meetup" },
  { value: "rescue_campaign", label: "Rescue Campaign" },
  { value: "other", label: "Other Event" },
] as const;

export const COURSE_CATEGORIES = [
  { value: "training", label: "Training" },
  { value: "breeding", label: "Breeding" },
  { value: "health", label: "Health" },
  { value: "polo", label: "Polo" },
  { value: "nutrition", label: "Nutrition" },
  { value: "other", label: "Other" },
] as const;

export const BLOG_CATEGORIES = [
  { value: "guides", label: "Guides" },
  { value: "training", label: "Training" },
  { value: "health", label: "Health" },
  { value: "culture", label: "Culture" },
  { value: "events", label: "Events" },
  { value: "polo", label: "Polo" },
  { value: "tent_pegging", label: "Tent Pegging" },
  { value: "tack", label: "Tack" },
  { value: "nutrition", label: "Nutrition" },
  { value: "buying_guide", label: "Buying Guide" },
  { value: "marketplace-safety", label: "Marketplace Safety" },
  { value: "country-culture", label: "Country Culture" },
  { value: "breeds-care", label: "Breeds & Care" },
  { value: "club-guides", label: "Club Guides" },
] as const;

export const NAV_LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/clubs", label: "Clubs" },
  { href: "/trainers", label: "Trainers" },
  { href: "/events", label: "Events" },
  { href: "/courses", label: "Courses" },
  { href: "/blog", label: "Blog" },
  { href: "/community", label: "Community" },
  { href: "/horse-health", label: "Horse Health" },
] as const;

export const MARKETPLACE_TABS = [
  { href: "/marketplace", label: "Horses", exact: true as const },
  { href: "/marketplace/products", label: "Products" },
  { href: "/marketplace/services", label: "Services" },
  { href: "/marketplace/sellers", label: "Sellers" },
] as const;

export const SELLER_TYPES = [
  { value: "individual", label: "Individual Seller" },
  { value: "breeder", label: "Horse Breeder" },
  { value: "tack_shop", label: "Tack Shop" },
  { value: "feed_supplier", label: "Feed Supplier" },
  { value: "equipment", label: "Stable Equipment Supplier" },
  { value: "service_provider", label: "Service Provider" },
  { value: "other", label: "Other" },
] as const;

export const PRODUCT_CATEGORIES = [
  { value: "tack", label: "Tack & Riding Gear" },
  { value: "feed", label: "Feed & Supplements" },
  { value: "stable", label: "Stable Equipment" },
  { value: "grooming", label: "Grooming" },
  { value: "apparel", label: "Riding Apparel" },
  { value: "other", label: "Other" },
] as const;

export const SERVICE_CATEGORIES = [
  { value: "transport", label: "Horse Transport" },
  { value: "farrier", label: "Farrier" },
  { value: "vet", label: "Veterinary" },
  { value: "training", label: "Training" },
  { value: "photography", label: "Photography" },
  { value: "other", label: "Other Service" },
] as const;

export const STOCK_STATUSES = [
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "made_to_order", label: "Made to Order" },
  { value: "out_of_stock", label: "Out of Stock" },
] as const;

export const DELIVERY_OPTIONS = [
  { value: "pickup", label: "Local Pickup" },
  { value: "delivery", label: "Delivery Available" },
  { value: "shipping", label: "Shipping" },
  { value: "digital", label: "Digital Delivery" },
] as const;

export const PRICING_MODELS = [
  { value: "fixed", label: "Fixed Price" },
  { value: "hourly", label: "Hourly Rate" },
  { value: "per_session", label: "Per Session" },
  { value: "quote", label: "Quote on Request" },
] as const;

export const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "upi", label: "UPI" },
  { value: "other", label: "Other" },
] as const;

export const EXPERT_CATEGORIES = [
  { value: "vet", label: "Veterinarian" },
  { value: "farrier", label: "Farrier" },
  { value: "nutrition", label: "Nutrition Expert" },
  { value: "behavior", label: "Behavior Specialist" },
  { value: "breeding", label: "Breeding Expert" },
  { value: "other", label: "Other Expert" },
] as const;

export const HEALTH_PROBLEM_TYPES = [
  { value: "lameness", label: "Lameness / Movement" },
  { value: "colic", label: "Colic / Digestive" },
  { value: "respiratory", label: "Respiratory" },
  { value: "skin", label: "Skin / Coat" },
  { value: "behavior", label: "Behavior" },
  { value: "nutrition", label: "Nutrition / Weight" },
  { value: "injury", label: "Injury / Wound" },
  { value: "other", label: "Other" },
] as const;

export const URGENCY_LEVELS = [
  { value: "routine", label: "Routine — not urgent" },
  { value: "soon", label: "Needs attention soon" },
  { value: "urgent", label: "Urgent — contact vet if emergency" },
] as const;
