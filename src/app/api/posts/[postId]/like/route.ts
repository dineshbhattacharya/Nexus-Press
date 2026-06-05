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
      return NextResponse.json({ error: "You must be signed in to like posts." }, { status: 401 });
    }

    const userId = user.id;

    // Check if like exists
    const existingLike = await db.like.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    let liked = false;

    if (existingLike) {
      // Unlike
      await db.like.delete({
        where: {
          userId_postId: { userId, postId },
        },
      });
      liked = false;
    } else {
      // Like
      await db.like.create({
        data: { userId, postId },
      });
      liked = true;
    }

    // Get updated total likes count
    const likesCount = await db.like.count({
      where: { postId },
    });

    return NextResponse.json({ success: true, liked, likesCount });
  } catch (error: any) {
    console.error("Like toggle error:", error);
    return NextResponse.json({ error: "Failed to toggle like." }, { status: 500 });
  }
}
