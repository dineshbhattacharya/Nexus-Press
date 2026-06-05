import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET /api/posts/[postId]/comment - Fetch all comments for a post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    const comments = await db.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.error("Fetch comments error:", error);
    return NextResponse.json({ error: "Failed to load comments." }, { status: 500 });
  }
}

// POST /api/posts/[postId]/comment - Create a new comment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "You must be signed in to comment." }, { status: 401 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Comment content cannot be empty." }, { status: 400 });
    }

    const comment = await db.comment.create({
      data: {
        content: content.trim(),
        postId,
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

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json({ error: "Failed to publish comment." }, { status: 500 });
  }
}
