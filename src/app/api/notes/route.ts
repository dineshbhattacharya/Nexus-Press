import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "You must be signed in to post a note." }, { status: 401 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Note content cannot be empty." }, { status: 400 });
    }

    if (content.length > 280) {
      return NextResponse.json({ error: "Notes must be under 280 characters." }, { status: 400 });
    }

    const note = await db.note.create({
      data: {
        content: content.trim(),
        userId: user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error("Create note error:", error);
    return NextResponse.json({ error: "Failed to publish note." }, { status: 500 });
  }
}
