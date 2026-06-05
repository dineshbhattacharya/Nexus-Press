import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// PUT /api/writer/posts/[postId] - Update an existing post
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Find writer's publication
    const pub = await db.publication.findFirst({
      where: { writerId: user.id },
    });

    if (!pub) {
      return NextResponse.json({ error: "Publication not found." }, { status: 404 });
    }

    // Verify post exists and belongs to publication
    const post = await db.post.findFirst({
      where: { id: postId, publicationId: pub.id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found or access denied." }, { status: 404 });
    }

    const body = await req.json();
    const { title, slug, content, excerpt, coverImage, status, visibility } = body;

    // Build update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (status !== undefined) updateData.status = status;
    if (visibility !== undefined) updateData.visibility = visibility;

    if (slug !== undefined) {
      const cleanedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
      
      // If slug changed, verify uniqueness
      if (cleanedSlug !== post.slug) {
        const existingPost = await db.post.findUnique({
          where: {
            publicationId_slug: {
              publicationId: pub.id,
              slug: cleanedSlug,
            },
          },
        });
        if (existingPost) {
          return NextResponse.json({ error: "A post with this URL slug already exists." }, { status: 400 });
        }
        updateData.slug = cleanedSlug;
      }
    }

    const updatedPost = await db.post.update({
      where: { id: postId },
      data: updateData,
    });

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error) {
    console.error("Writer update post error:", error);
    return NextResponse.json({ error: "Failed to update post." }, { status: 500 });
  }
}

// DELETE /api/writer/posts/[postId] - Delete a post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Find writer's publication
    const pub = await db.publication.findFirst({
      where: { writerId: user.id },
    });

    if (!pub) {
      return NextResponse.json({ error: "Publication not found." }, { status: 404 });
    }

    // Verify post exists and belongs to publication
    const post = await db.post.findFirst({
      where: { id: postId, publicationId: pub.id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found or access denied." }, { status: 404 });
    }

    await db.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ success: true, message: "Post deleted successfully." });
  } catch (error) {
    console.error("Writer delete post error:", error);
    return NextResponse.json({ error: "Failed to delete post." }, { status: 500 });
  }
}
