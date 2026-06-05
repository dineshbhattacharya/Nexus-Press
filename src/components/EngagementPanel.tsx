"use client";

import React, { useState, useEffect, useRef } from "react";
import { Heart, MessageSquare, Bookmark, Volume2, VolumeX, Play, Pause, X, Loader2, Send } from "lucide-react";
import styles from "@/app/p/[pubSlug]/[postSlug]/page.module.css";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    avatar: string;
  };
}

interface EngagementPanelProps {
  postId: string;
  initialLikesCount: number;
  initialLiked: boolean;
  initialBookmarked: boolean;
  initialCommentsCount: number;
  postTitle: string;
  postContentHtml: string;
  currentUser: any;
}

export default function EngagementPanel({
  postId,
  initialLikesCount,
  initialLiked,
  initialBookmarked,
  initialCommentsCount,
  postTitle,
  postContentHtml,
  currentUser,
}: EngagementPanelProps) {
  // Engagement States
  const [likes, setLikes] = useState(initialLikesCount);
  const [liked, setLiked] = useState(initialLiked);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);

  // Drawer States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // TTS States
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [ttsPaused, setTtsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Clean HTML to get plain text for TTS
  const getPlainText = (html: string) => {
    if (typeof window === "undefined") return "";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  // Sync TTS on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Fetch comments when drawer opens
  useEffect(() => {
    if (drawerOpen) {
      fetchComments();
    }
  }, [drawerOpen]);

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comment`);
      const data = await res.json();
      if (res.ok) {
        setComments(data.comments);
        setCommentsCount(data.comments.length);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      alert("Please sign in to like articles.");
      return;
    }

    // Optimistic Update
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);

    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
        setLikes(data.likesCount);
      }
    } catch (err) {
      // Revert on error
      setLiked(liked);
      setLikes(likes);
      console.error("Failed to toggle like:", err);
    }
  };

  const handleBookmark = async () => {
    if (!currentUser) {
      alert("Please sign in to save articles.");
      return;
    }

    setBookmarked(!bookmarked);

    try {
      const res = await fetch(`/api/posts/${postId}/bookmark`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setBookmarked(data.bookmarked);
      }
    } catch (err) {
      setBookmarked(bookmarked);
      console.error("Failed to toggle bookmark:", err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await res.json();
      if (res.ok) {
        setComments([data.comment, ...comments]);
        setCommentsCount(commentsCount + 1);
        setNewComment("");
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Text-To-Speech Controls
  const handleTtsToggle = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    const synth = window.speechSynthesis;

    if (ttsPlaying) {
      if (ttsPaused) {
        synth.resume();
        setTtsPaused(false);
      } else {
        synth.pause();
        setTtsPaused(true);
      }
    } else {
      synth.cancel(); // Stop any ongoing speech
      
      const articleText = getPlainText(postContentHtml);
      const fullSpeechText = `Reading article: ${postTitle}. ${articleText}`;
      
      const utterance = new SpeechSynthesisUtterance(fullSpeechText);
      utteranceRef.current = utterance;

      // Select a high-quality voice if available
      const voices = synth.getVoices();
      const preferredVoice = voices.find(
        (v) => v.name.includes("Google US English") || v.name.includes("Samantha") || v.lang.startsWith("en-US")
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.rate = 1.05; // Slightly faster reading rate

      utterance.onend = () => {
        setTtsPlaying(false);
        setTtsPaused(false);
      };

      utterance.onerror = (e) => {
        console.error("TTS Error:", e);
        setTtsPlaying(false);
        setTtsPaused(false);
      };

      synth.speak(utterance);
      setTtsPlaying(true);
      setTtsPaused(false);
    }
  };

  const handleTtsStop = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setTtsPlaying(false);
      setTtsPaused(false);
    }
  };

  return (
    <>
      {/* Floating Action Bar */}
      <div className={`${styles.actionsBar} glass-panel`}>
        {/* Like */}
        <button 
          onClick={handleLike} 
          className={`${styles.actionBarItem} ${liked ? styles.actionBarActive : ""}`}
          aria-label="Like post"
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} />
          <span>{likes}</span>
        </button>

        <span className={styles.divider} />

        {/* Comments */}
        <button 
          onClick={() => setDrawerOpen(true)} 
          className={styles.actionBarItem}
          aria-label="Open comments"
        >
          <MessageSquare size={18} />
          <span>{commentsCount}</span>
        </button>

        <span className={styles.divider} />

        {/* Text-To-Speech */}
        <button 
          onClick={handleTtsToggle} 
          className={`${styles.actionBarItem} ${ttsPlaying ? styles.actionBarActive : ""}`}
          aria-label="Listen to post"
        >
          {ttsPlaying ? (
            ttsPaused ? <Play size={18} /> : <Pause size={18} />
          ) : (
            <Volume2 size={18} />
          )}
          <span>{ttsPlaying ? (ttsPaused ? "Resuming..." : "Listening...") : "Listen"}</span>
        </button>

        {ttsPlaying && (
          <button 
            onClick={handleTtsStop} 
            className={styles.actionBarItem} 
            style={{ color: "#ef4444", padding: "8px" }}
            aria-label="Stop listening"
          >
            <VolumeX size={16} />
          </button>
        )}

        <span className={styles.divider} />

        {/* Bookmark */}
        <button 
          onClick={handleBookmark} 
          className={`${styles.actionBarItem} ${bookmarked ? styles.actionBarActive : ""}`}
          aria-label="Save post"
        >
          <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
          <span>{bookmarked ? "Saved" : "Save"}</span>
        </button>
      </div>

      {/* Slide-out Comments Drawer */}
      {drawerOpen && (
        <>
          <div className={styles.drawerOverlay} onClick={() => setDrawerOpen(false)} />
          <div className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>Comments ({commentsCount})</h3>
              <button className={styles.drawerClose} onClick={() => setDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.drawerContent}>
              {/* Comment submission form */}
              {currentUser ? (
                <form onSubmit={handlePostComment} className={styles.commentForm}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Join the discussion..."
                    className={styles.commentInput}
                    disabled={submittingComment}
                    required
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ alignSelf: "flex-end" }}
                    disabled={submittingComment || !newComment.trim()}
                  >
                    {submittingComment ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={14} /> Send
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: "16px", textAlign: "center", marginBottom: "24px" }}>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                    Sign in to join the conversation.
                  </p>
                  <a href="/login" className="btn btn-secondary" style={{ fontSize: "0.8rem", padding: "6px 12px" }}>
                    Sign In
                  </a>
                </div>
              )}

              {/* Comments list */}
              {commentsLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                  <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} />
                </div>
              ) : comments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  No comments yet. Start the conversation!
                </div>
              ) : (
                <div className={styles.commentsList}>
                  {comments.map((comment) => (
                    <div key={comment.id} className={styles.commentItem}>
                      <img 
                        src={comment.user.avatar || ""} 
                        alt="" 
                        className={styles.commentAvatar} 
                      />
                      <div className={styles.commentItemContent}>
                        <div>
                          <span className={styles.commentUser}>{comment.user.name}</span>
                          <span className={styles.commentTime}>
                            {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <p className={styles.commentText}>{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
