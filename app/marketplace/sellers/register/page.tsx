import { Suspense } from "react";
import SellerRegisterPage from "./SellerRegisterClient";

export default function SellerRegisterWrapper() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-4 py-8"><p className="text-stone-500">Loading…</p></div>}>
      <SellerRegisterPage />
    </Suspense>
  );
}
