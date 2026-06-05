import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { MessageSquare, Sparkles } from "lucide-react";
import ComposeNoteForm from "@/components/ComposeNoteForm";
import NoteLikeButton from "@/components/NoteLikeButton";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const user = await getSessionUser();

  // 1. Fetch all notes with author details
  const notes = await db.note.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 2. Fetch publication recommendations for the sidebar
  const recommendations = await db.publication.findMany({
    include: {
      writer: {
        select: {
          name: true,
        },
      },
    },
    take: 4,
  });

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* Left column: Feed stream */}
        <section>
          {/* Note composing form */}
          <ComposeNoteForm user={user} />

          {/* Notes list */}
          <div className={styles.feedList}>
            {notes.length === 0 ? (
              <div className={`${styles.composeCard} card`} style={{ textAlign: "center", padding: "48px 24px" }}>
                <MessageSquare size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px auto" }} />
                <p style={{ color: "var(--text-secondary)" }}>No updates posted yet. Be the first to share one!</p>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className={styles.noteItem}>
                  <img 
                    src={note.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(note.user.email)}`} 
                    alt="" 
                    className={styles.avatar} 
                  />
                  <div className={styles.noteContent}>
                    <div className={styles.noteHeader}>
                      <div className={styles.noteAuthor}>
                        <span className={styles.authorName}>{note.user.name}</span>
                        <span className={styles.noteTime}>
                          {new Date(note.createdAt).toLocaleDateString("en-US", { 
                            month: "short", 
                            day: "numeric", 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </span>
                      </div>
                    </div>

                    <p className={styles.noteText}>{note.content}</p>

                    {/* Liking actions */}
                    <NoteLikeButton noteId={note.id} initialLikes={note.likes} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right column: Sidebar Widgets */}
        <aside className={styles.sidebar}>
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>
              <Sparkles size={16} style={{ color: "var(--accent-orange)", marginRight: "6px", display: "inline" }} />
              Who to follow
            </h3>
            
            <div className={styles.recommendationsList}>
              {recommendations.map((pub) => (
                <div key={pub.id} className={styles.recommendationItem}>
                  <div className={styles.recInfo}>
                    <div style={{ fontSize: "1.25rem" }}>{pub.logo}</div>
                    <div className={styles.recMeta}>
                      <span className={styles.recName}>{pub.title}</span>
                      <span className={styles.recPub}>by {pub.writer.name}</span>
                    </div>
                  </div>
                  
                  <Link href={`/p/${pub.slug}`} className={`${styles.btnFollow} btn btn-secondary`}>
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>
          
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>About Notes</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              Notes is a dedicated space on NexusPress for sharing quick ideas, fragments of writing, links, and updates. 
              It brings writers and readers closer together in a unified micro-community.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
