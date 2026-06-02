import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, getAdminPassword, getAdminSessionValue } from "../../admin/auth";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { password?: string } | null;

  if (!body?.password || body.password !== getAdminPassword()) {
    return NextResponse.json({ message: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, getAdminSessionValue(), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
