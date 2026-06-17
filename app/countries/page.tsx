import Link from "next/link";
import { COUNTRIES } from "@/lib/countries";

export default function CountriesIndexPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Browse by country</h1>
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {COUNTRIES.map((c) => (
          <Link key={c.code} href={`/countries/${c.code}`} className="card p-3 text-sm no-underline hover:shadow-md">
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
