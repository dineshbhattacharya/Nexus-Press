"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import styles from "@/app/dashboard/page.module.css";

interface DeletePostButtonProps {
  postId: string;
}

export default function DeletePostButton({ postId }: DeletePostButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this article? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/writer/posts/${postId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete post.");
      }
    } catch (err) {
      console.error("Delete post error:", err);
      alert("Network error. Failed to delete post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className={`${styles.btnAction} btn btn-secondary`}
      style={{ color: "#ef4444" }}
      disabled={loading}
      title="Delete Article"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Trash2 size={14} />
      )}
    </button>
  );
}
