"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import styles from "@/app/bookmarks/page.module.css";

interface RemoveBookmarkButtonProps {
  postId: string;
}

export default function RemoveBookmarkButton({ postId }: RemoveBookmarkButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/bookmark`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleRemove} 
      className={styles.removeButton}
      disabled={loading}
      aria-label="Remove from library"
    >
      {loading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : (
        <>
          <Trash2 size={12} /> Remove
        </>
      )}
    </button>
  );
}
