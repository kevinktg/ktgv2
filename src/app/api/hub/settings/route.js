import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Hub settings stored in a cookie for now (no DB needed for MVP)
// Future: migrate to Vercel Postgres user_settings table
const COOKIE_NAME = "ktg-hub-settings";
const DEFAULT_SETTINGS = {
  activeMcps: [],
  activeSkills: [],
  defaultModel: "gemini-2.5-flash",
  defaultPersona: "default",
};

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;

  if (!raw) {
    return NextResponse.json(DEFAULT_SETTINGS);
  }

  try {
    const settings = JSON.parse(raw);
    return NextResponse.json({ ...DEFAULT_SETTINGS, ...settings });
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate
    const settings = {
      activeMcps: Array.isArray(body.activeMcps) ? body.activeMcps : [],
      activeSkills: Array.isArray(body.activeSkills) ? body.activeSkills : [],
      defaultModel: body.defaultModel || "gemini-2.5-flash",
      defaultPersona: body.defaultPersona || "default",
    };

    const response = NextResponse.json({ success: true, settings });

    response.cookies.set(COOKIE_NAME, JSON.stringify(settings), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
