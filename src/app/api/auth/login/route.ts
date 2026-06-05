import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: {
        publications: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await setSessionCookie(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        publications: user.publications,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "An error occurred during login." }, { status: 500 });
  }
}
