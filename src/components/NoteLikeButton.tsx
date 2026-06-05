"use client";

import React, { useState } from "react";
import { Heart, MessageSquare } from "lucide-react";
import styles from "@/app/notes/page.module.css";

interface NoteLikeButtonProps {
  noteId: string;
  initialLikes: number;
}

export default function NoteLikeButton({ noteId, initialLikes }: NoteLikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    // Optimistic increase (notes have simplified direct increments)
    setLiked(true);
    setLikes(likes + 1);

    try {
      const res = await fetch(`/api/notes/${noteId}/like`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setLikes(data.likes);
      }
    } catch (err) {
      console.error("Failed to like note:", err);
    }
  };

  return (
    <div className={styles.noteActions}>
      <button 
        onClick={handleLike} 
        className={`${styles.actionButton} ${liked ? styles.likedButton : ""}`}
        disabled={liked}
        aria-label="Like note"
      >
        <Heart size={16} fill={liked ? "currentColor" : "none"} />
        <span>{likes}</span>
      </button>
      <button 
        className={styles.actionButton} 
        style={{ cursor: "default" }}
        aria-label="Replies count (mocked)"
      >
        <MessageSquare size={16} />
        <span>0</span>
      </button>
    </div>
  );
}
