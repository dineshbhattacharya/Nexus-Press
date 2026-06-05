"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import styles from "@/app/notes/page.module.css";

interface ComposeNoteFormProps {
  user: any;
}

export default function ComposeNoteForm({ user }: ComposeNoteFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length > 280 || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (res.ok) {
        setContent("");
        router.refresh();
      } else {
        setError(data.error || "Failed to post note.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={styles.composeCard} style={{ textAlign: "center", padding: "24px" }}>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
          Sign in to share your thoughts with the community.
        </p>
        <a href="/login" className="btn btn-secondary" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>
          Sign In to Share Note
        </a>
      </div>
    );
  }

  const charLeft = 280 - content.length;

  return (
    <div className={styles.composeCard}>
      <form onSubmit={handlePost} className={styles.composeRow}>
        <img 
          src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.email)}`} 
          alt="" 
          className={styles.avatar} 
        />
        <div className={styles.composeForm}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Share a quick update..."
            className={styles.textarea}
            disabled={loading}
            maxLength={300}
            required
          />
          {error && <p style={{ fontSize: "0.8rem", color: "#ef4444" }}>{error}</p>}
          <div className={styles.composeActions}>
            <span className={`${styles.charCount} ${charLeft < 0 ? styles.charLimitExceeded : ""}`}>
              {charLeft} characters left
            </span>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || content.trim().length === 0 || charLeft < 0}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Share Note"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
