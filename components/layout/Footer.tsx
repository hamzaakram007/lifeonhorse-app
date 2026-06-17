import Link from "next/link";
import { BRAND_NAME, LAUNCH_COUNTRIES } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-stone-900 text-stone-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-white">{BRAND_NAME}</p>
          <p className="mt-2 text-sm">Global horse marketplace, clubs, trainers & community.</p>
        </div>
        <div>
          <p className="font-semibold text-white">Explore</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/marketplace" className="hover:text-amber-400">Marketplace</Link></li>
            <li><Link href="/clubs" className="hover:text-amber-400">Clubs</Link></li>
            <li><Link href="/trainers" className="hover:text-amber-400">Trainers</Link></li>
            <li><Link href="/events" className="hover:text-amber-400">Events</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Learn</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/courses" className="hover:text-amber-400">Courses</Link></li>
            <li><Link href="/blog" className="hover:text-amber-400">Blog</Link></li>
            <li><Link href="/community" className="hover:text-amber-400">Community</Link></li>
            <li><Link href="/payments" className="hover:text-amber-400">Payment by Country</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Launch Countries</p>
          <p className="mt-2 text-sm">
            {LAUNCH_COUNTRIES.map((c) => c.name).join(" · ")}
          </p>
        </div>
      </div>
      <div className="border-t border-stone-800 px-4 py-4 text-center text-xs">
        © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
