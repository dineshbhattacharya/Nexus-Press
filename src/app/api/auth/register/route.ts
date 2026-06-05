import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, bio, avatar, publicationTitle, publicationSlug, publicationDescription } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    // Create user and optional publication in a transaction
    const result = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: name || email.split("@")[0],
          email,
          passwordHash,
          bio,
          avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`,
        },
      });

      let newPublication = null;
      if (publicationTitle && publicationSlug) {
        // Check if slug is taken
        const existingPub = await tx.publication.findUnique({ where: { slug: publicationSlug } });
        if (existingPub) {
          throw new Error("Publication URL/slug is already taken.");
        }

        newPublication = await tx.publication.create({
          data: {
            title: publicationTitle,
            slug: publicationSlug.toLowerCase().replace(/[^a-z0-9-]/g, ""),
            description: publicationDescription || "",
            logo: "✍️",
            cover: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800",
            writerId: newUser.id,
          },
        });
      }

      return { user: newUser, publication: newPublication };
    });

    await setSessionCookie(result.user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        avatar: result.user.avatar,
      },
      publication: result.publication,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "An error occurred during registration." }, { status: 500 });
  }
}
