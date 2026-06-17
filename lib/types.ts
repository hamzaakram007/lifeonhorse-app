export type UserRole =
  | "member"
  | "seller"
  | "trainer"
  | "club_owner"
  | "course_creator"
  | "moderator"
  | "admin";

export type ListingStatus = "draft" | "published" | "hidden" | "removed";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  country_code: string | null;
  city: string | null;
  bio: string | null;
  phone: string | null;
  is_suspended: boolean;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Horse {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  breed: string | null;
  age: number | null;
  gender: string | null;
  price: number | null;
  currency: string | null;
  country_code: string | null;
  city: string | null;
  discipline: string | null;
  purpose: string | null;
  height_cm: number | null;
  color: string | null;
  listing_type: string | null;
  photos: string[];
  video_url: string | null;
  is_featured: boolean;
  status: ListingStatus;
  created_at: string;
}

export interface Country {
  code: string;
  name: string;
}

export type EntityType =
  | "horse"
  | "product"
  | "service"
  | "club"
  | "trainer"
  | "event"
  | "course"
  | "expert"
  | "seller";
