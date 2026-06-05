import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET /api/writer/posts - Fetch all posts for the logged-in writer's publication
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const pub = await db.publication.findFirst({
      where: { writerId: user.id },
    });

    if (!pub) {
      return NextResponse.json({ error: "Publication not found. Please set one up first." }, { status: 404 });
    }

    const posts = await db.post.findMany({
      where: { publicationId: pub.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error("Writer fetch posts error:", error);
    return NextResponse.json({ error: "Failed to fetch posts." }, { status: 500 });
  }
}

// POST /api/writer/posts - Create a new post under the writer's publication
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const pub = await db.publication.findFirst({
      where: { writerId: user.id },
    });

    if (!pub) {
      return NextResponse.json({ error: "Publication not found." }, { status: 404 });
    }

    const body = await req.json();
    const { title, slug, content, excerpt, coverImage, status = "DRAFT", visibility = "FREE" } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and URL slug are required." }, { status: 400 });
    }

    // Clean slug format
    const cleanedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");

    // Verify slug uniqueness in this publication
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

    const post = await db.post.create({
      data: {
        title,
        slug: cleanedSlug,
        content: content || "",
        excerpt: excerpt || "",
        coverImage: coverImage || null,
        status,
        visibility,
        publicationId: pub.id,
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("Writer create post error:", error);
    return NextResponse.json({ error: "Failed to create post." }, { status: 500 });
  }
}
