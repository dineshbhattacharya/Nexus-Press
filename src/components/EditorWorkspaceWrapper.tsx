"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically load the EditorWorkspace on the client side with ssr disabled
const EditorWorkspace = dynamic(() => import("./EditorWorkspace"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Loader2 size={36} className="animate-spin" style={{ color: "var(--accent-orange)" }} />
    </div>
  ),
});

interface EditorWorkspaceWrapperProps {
  initialPost?: any;
}

export default function EditorWorkspaceWrapper({ initialPost }: EditorWorkspaceWrapperProps) {
  return <EditorWorkspace initialPost={initialPost} />;
}
