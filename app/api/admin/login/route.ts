import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  getAdminPassword,
  createSessionToken,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/auth";

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }

  if (!body.password || body.password !== getAdminPassword()) {
    return NextResponse.json(
      { success: false, error: "Incorrect password" },
      { status: 401 },
    );
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, createSessionToken(), SESSION_COOKIE_OPTIONS);
  return NextResponse.json({ success: true });
}
