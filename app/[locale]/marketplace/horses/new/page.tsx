import { HorseListingForm } from "@/components/marketplace/HorseListingForm";

export default function NewHorsePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-serif text-2xl font-bold">List a horse</h1>
      <p className="text-sm text-stone-600">
        Add multiple photos and an optional video — publishes immediately.
      </p>
      <HorseListingForm mode="create" />
    </div>
  );
}
