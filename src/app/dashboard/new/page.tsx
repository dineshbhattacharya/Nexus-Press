import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import EditorWorkspaceWrapper from "@/components/EditorWorkspaceWrapper";

export default async function NewPostPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <EditorWorkspaceWrapper />
  );
}
