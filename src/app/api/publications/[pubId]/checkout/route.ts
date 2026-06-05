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
    const { email, name, cardNumber, expiry, cvc } = body;

    let userId = null;

    // Verify publication exists
    const publication = await db.publication.findUnique({
      where: { id: pubId },
    });

    if (!publication) {
      return NextResponse.json({ error: "Publication not found." }, { status: 404 });
    }

    // Check if user is logged in
    const sessionUser = await getSessionUser();
    if (sessionUser) {
      userId = sessionUser.id;
    } else if (email) {
      // Find or create reader user
      let user = await db.user.findUnique({ where: { email } });
      if (!user) {
        const dummyPasswordHash = await hashPassword("password123");
        user = await db.user.create({
          data: {
            email,
            name: name || email.split("@")[0],
            passwordHash: dummyPasswordHash,
            bio: "Premium Reader on NexusPress",
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`,
          },
        });
      }
      userId = user.id;
      // Auto login the new/found reader
      await setSessionCookie(userId);
    } else {
      return NextResponse.json({ error: "Email or active session required to checkout." }, { status: 400 });
    }

    // Mock validation of credit card parameters
    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
      return NextResponse.json({ error: "Invalid credit card number." }, { status: 400 });
    }
    if (!expiry || !expiry.includes("/")) {
      return NextResponse.json({ error: "Invalid expiry date (use MM/YY)." }, { status: 400 });
    }
    if (!cvc || cvc.length < 3) {
      return NextResponse.json({ error: "Invalid CVC code." }, { status: 400 });
    }

    // Upsert subscription to PREMIUM
    const subscription = await db.subscription.upsert({
      where: {
        userId_publicationId: {
          userId,
          publicationId: pubId,
        },
      },
      update: {
        tier: "PREMIUM",
      },
      create: {
        userId,
        publicationId: pubId,
        tier: "PREMIUM",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription upgraded to premium successfully!",
      subscription,
    });
  } catch (error: any) {
    console.error("Checkout upgrade error:", error);
    return NextResponse.json({ error: error.message || "An error occurred during checkout." }, { status: 500 });
  }
}
