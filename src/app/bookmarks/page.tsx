import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Bookmark as BookmarkIcon, Clock, ArrowRight, Library } from "lucide-react";
import RemoveBookmarkButton from "@/components/RemoveBookmarkButton";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const user = await getSessionUser();

  // If not logged in, show login prompt
  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <Library size={48} className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>Your Library</h2>
          <p className={styles.emptyText}>
            Sign in to bookmark articles, save drafts, and build your personalized reading list.
          </p>
          <Link href="/login" className="btn btn-primary">
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  // Fetch bookmarks for logged in user
  const bookmarks = await db.bookmark.findMany({
    where: { userId: user.id },
    include: {
      post: {
        include: {
          publication: {
            select: {
              title: true,
              slug: true,
              logo: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Library</h1>
      <p className={styles.subtitle}>Saved articles and bookmarks.</p>

      {bookmarks.length === 0 ? (
        <div className={styles.emptyState}>
          <BookmarkIcon size={40} className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>Your library is empty</h2>
          <p className={styles.emptyText}>
            Click the "Save" button on any article to add it to your library and read it later.
          </p>
          <Link href="/" className="btn btn-primary" style={{ display: "flex", gap: "8px" }}>
            Explore Articles <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className={styles.list}>
          {bookmarks.map(({ id, post }) => {
            const readTime = Math.ceil(post.content.split(/\s+/).length / 200);
            return (
              <div key={id} className={`${styles.item} card`}>
                <div className={styles.content}>
                  <div>
                    <Link href={`/p/${post.publication.slug}`} className={styles.pubHeader}>
                      <span>{post.publication.logo}</span>
                      <strong>{post.publication.title}</strong>
                    </Link>
                    <Link href={`/p/${post.publication.slug}/${post.slug}`}>
                      <h3 className={styles.postTitle}>{post.title}</h3>
                    </Link>
                    <p className={styles.excerpt}>{post.excerpt}</p>
                  </div>

                  <div className={styles.meta}>
                    <div className={styles.metaLeft}>
                      <span>{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      <span>•</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={12} /> {readTime} min read
                      </span>
                    </div>
                    {/* Inline untoggle bookmark button */}
                    <RemoveBookmarkButton postId={post.id} />
                  </div>
                </div>

                {post.coverImage && (
                  <div className={styles.imageWrapper}>
                    <img src={post.coverImage} alt="" className={styles.image} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
