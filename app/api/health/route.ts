import { NextResponse } from "next/server";
import { getPublicEnv } from "@/lib/env";

export async function GET() {
  try {
    getPublicEnv();
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "lifeonhorse-app",
    });
  } catch {
    return NextResponse.json(
      { status: "degraded", error: "Environment not configured" },
      { status: 503 }
    );
  }
}
