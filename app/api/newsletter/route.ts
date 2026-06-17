import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = form.get("email");
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }
  return NextResponse.redirect(new URL("/?subscribed=1", request.url));
}
