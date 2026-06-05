import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const { noteId } = await params;

    const note = await db.note.update({
      where: { id: noteId },
      data: {
        likes: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true, likes: note.likes });
  } catch (error) {
    console.error("Like note error:", error);
    return NextResponse.json({ error: "Failed to like note." }, { status: 500 });
  }
}
