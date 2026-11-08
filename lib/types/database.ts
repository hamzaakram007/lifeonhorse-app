export type UserRole =
  | "member"
  | "seller"
  | "trainer"
  | "club_owner"
  | "course_creator"
  | "moderator"
  | "admin";

export type ContentStatus = "draft" | "published" | "hidden" | "removed";
export type ListingType = "sale" | "adoption" | "stud" | "lease" | "wanted";
export type ClubType =
  | "polo"
  | "tent_pegging"
  | "racing"
  | "riding_school"
  | "breeding"
  | "equestrian_sports"
  | "rescue"
  | "cultural"
  | "general"
  | "other";
export type EntityKind =
  | "horse"
  | "club"
  | "trainer"
  | "event"
  | "course"
  | "blog_post"
  | "user"
  | "gallery";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  bio: string | null;
  role: UserRole;
  is_verified: boolean;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

export interface Horse {
  id: string;
  owner_id: string;
  title: string;
  slug: string;
  description: string | null;
  listing_type: ListingType;
  breed: string | null;
  age: number | null;
  gender: string | null;
  color: string | null;
  height: string | null;
  discipline: string | null;
  purpose: string | null;
  price: number | null;
  currency: string | null;
  country: string | null;
  city: string | null;
  photos: string[];
  videos: string[];
  health_notes: string | null;
  pedigree_notes: string | null;
  status: ContentStatus;
  is_featured: boolean;
  is_verified: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Club {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  club_type: ClubType;
  country: string | null;
  city: string | null;
  address: string | null;
  logo_url: string | null;
  photos: string[];
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  social_links: Record<string, string>;
  services: string | null;
  membership_available: boolean;
  training_available: boolean;
  member_count: number;
  horse_count: number;
  status: ContentStatus;
  is_featured: boolean;
  is_verified: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Trainer {
  id: string;
  user_id: string;
  display_name: string;
  slug: string;
  trainer_type: string;
  specialties: string[];
  country: string | null;
  city: string | null;
  experience_years: number | null;
  bio: string | null;
  certifications: string | null;
  photos: string[];
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp: string | null;
  website: string | null;
  status: ContentStatus;
  is_featured: boolean;
  is_verified: boolean;
  published_at: string | null;
  created_at: string;
  profiles?: Profile;
}

export interface Event {
  id: string;
  host_id: string;
  club_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  event_type: string;
  discipline: string | null;
  start_date: string | null;
  end_date: string | null;
  venue: string | null;
  country: string | null;
  city: string | null;
  registration_info: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  photos: string[];
  status: ContentStatus;
  is_featured: boolean;
  published_at: string | null;
  clubs?: Club;
}

export interface Course {
  id: string;
  creator_id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  level: string | null;
  is_free: boolean;
  price: number | null;
  currency: string | null;
  thumbnail_url: string | null;
  status: ContentStatus;
  is_featured: boolean;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  order_index: number;
}

export type BlogLinkedEntityType =
  | "club"
  | "trainer"
  | "event"
  | "course"
  | "seller"
  | "expert";

export interface BlogPost {
  id: string;
  author_id: string;
  category_id: string | null;
  /** Polymorphic link (club / trainer / course / expert / …). Paired with linked_entity_id. */
  linked_entity_type: BlogLinkedEntityType | null;
  linked_entity_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  category: string | null;
  seo_title: string | null;
  seo_description: string | null;
  status: ContentStatus;
  is_featured: boolean;
  published_at: string | null;
  created_at?: string;
  updated_at?: string;
  blog_categories?: { name: string; slug: string };
  profiles?: Profile;
}

export interface Inquiry {
  id: string;
  from_user_id: string | null;
  entity_type: EntityKind;
  entity_id: string;
  sender_name: string | null;
  sender_email: string;
  sender_phone: string | null;
  message: string;
  status: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string | null;
  entity_type: EntityKind;
  entity_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
}

export interface CommissionRecord {
  id: string;
  recorded_by: string;
  entity_type: EntityKind | null;
  entity_id: string | null;
  buyer_name: string | null;
  seller_name: string | null;
  amount: number;
  currency: string;
  commission_rate: number | null;
  commission_amount: number | null;
  notes: string | null;
  recorded_at: string;
}

export interface HealthRequest {
  id: string;
  user_id: string | null;
  problem_type: string;
  urgency: string;
  description?: string | null;
  symptoms: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  horse_name: string | null;
  horse_age: string | null;
  horse_breed: string | null;
  horse_gender: string | null;
  issue_duration: string | null;
  country: string | null;
  city: string | null;
  photos: string[];
  videos: string[];
  status: "new" | "reviewing" | "resolved" | "closed" | string;
  admin_notes: string | null;
  created_at: string;
  updated_at?: string;
}

/** Member stories / gallery (001 community_posts). Dual-publish stubs reuse these columns. */
export interface CommunityPost {
  id: string;
  author_id: string;
  title: string;
  content: string | null;
  photos: string[] | unknown;
  status: ContentStatus;
  created_at?: string;
  updated_at?: string;
}

/** In-app activity alert (012_activity_notifications). No email/push. */
export interface ActivityNotification {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  body: string | null;
  href: string | null;
  entity_type: string | null;
  entity_id: string | null;
  blog_post_id: string | null;
  is_read: boolean;
  created_at: string;
}
