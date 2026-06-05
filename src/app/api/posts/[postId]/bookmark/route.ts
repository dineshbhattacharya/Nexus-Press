import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "You must be signed in to save posts." }, { status: 401 });
    }

    const userId = user.id;

    // Check if bookmark exists
    const existingBookmark = await db.bookmark.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    let bookmarked = false;

    if (existingBookmark) {
      // Remove bookmark
      await db.bookmark.delete({
        where: {
          userId_postId: { userId, postId },
        },
      });
      bookmarked = false;
    } else {
      // Add bookmark
      await db.bookmark.create({
        data: { userId, postId },
      });
      bookmarked = true;
    }

    return NextResponse.json({ success: true, bookmarked });
  } catch (error: any) {
    console.error("Bookmark toggle error:", error);
    return NextResponse.json({ error: "Failed to toggle bookmark." }, { status: 500 });
  }
}
