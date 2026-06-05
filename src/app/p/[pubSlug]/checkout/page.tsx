import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import CheckoutClient from "@/components/CheckoutClient";

interface CheckoutPageProps {
  params: Promise<{ pubSlug: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { pubSlug } = await params;

  // 1. Fetch Publication details
  const pub = await db.publication.findUnique({
    where: { slug: pubSlug },
  });

  if (!pub) {
    notFound();
  }

  // 2. Fetch logged in user session
  const user = await getSessionUser();

  return (
    <CheckoutClient
      pubId={pub.id}
      pubTitle={pub.title}
      pubLogo={pub.logo || "✍️"}
      pubSlug={pub.slug}
      initialUser={user}
    />
  );
}
