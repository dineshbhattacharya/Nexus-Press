import React from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import EditorWorkspaceWrapper from "@/components/EditorWorkspaceWrapper";

interface EditPostPageProps {
  params: Promise<{ postId: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { postId } = await params;
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  // Find writer's publication
  const pub = await db.publication.findFirst({
    where: { writerId: user.id },
  });

  if (!pub) {
    redirect("/register?setup_pub=true");
  }

  // Fetch post and verify ownership
  const post = await db.post.findFirst({
    where: {
      id: postId,
      publicationId: pub.id,
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <EditorWorkspaceWrapper initialPost={post} />
  );
}
