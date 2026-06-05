import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, setSessionCookie, hashPassword } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ pubId: string }> }
) {
  try {
    const { pubId } = await params;
    const body = await req.json();
    const { email, tier = "FREE" } = body;

    let userId = null;

    // Check if user is logged in
    const sessionUser = await getSessionUser();
    if (sessionUser) {
      userId = sessionUser.id;
    } else if (email) {
      // User is not logged in but provided an email
      // Find or create reader user
      let user = await db.user.findUnique({ where: { email } });
      if (!user) {
        const dummyPasswordHash = await hashPassword("password123");
        user = await db.user.create({
          data: {
            email,
            name: email.split("@")[0],
            passwordHash: dummyPasswordHash,
            bio: "Reader on NexusPress",
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`,
          },
        });
      }
      userId = user.id;
      // Auto login the new/found reader
      await setSessionCookie(userId);
    } else {
      return NextResponse.json({ error: "Email or active session required to subscribe." }, { status: 400 });
    }

    // Verify publication exists
    const publication = await db.publication.findUnique({
      where: { id: pubId },
    });

    if (!publication) {
      return NextResponse.json({ error: "Publication not found." }, { status: 404 });
    }

    // Check if already subscribed
    const existingSub = await db.subscription.findUnique({
      where: {
        userId_publicationId: {
          userId,
          publicationId: pubId,
        },
      },
    });

    if (existingSub) {
      // If already subscribed, return success
      return NextResponse.json({
        success: true,
        message: "Already subscribed.",
        subscription: existingSub,
      });
    }

    // Create subscription
    const subscription = await db.subscription.create({
      data: {
        userId,
        publicationId: pubId,
        tier,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscribed successfully!",
      subscription,
    });
  } catch (error: any) {
    console.error("Subscription error:", error);
    return NextResponse.json({ error: error.message || "An error occurred while subscribing." }, { status: 500 });
  }
}
