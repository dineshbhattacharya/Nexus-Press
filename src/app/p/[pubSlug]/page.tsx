import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Clock, ArrowLeft, Mail } from "lucide-react";
import SubscribeWidget from "@/components/SubscribeWidget";
import ModalCloseWrapper from "@/components/ModalCloseWrapper";
import styles from "./page.module.css";

interface PubPageProps {
  params: Promise<{ pubSlug: string }>;
  searchParams: Promise<{ subscribe?: string }>;
}

export default async function PublicationPage({ params, searchParams }: PubPageProps) {
  const { pubSlug } = await params;
  const { subscribe } = await searchParams;

  // 1. Fetch Publication
  const pub = await db.publication.findUnique({
    where: { slug: pubSlug },
    include: {
      writer: {
        select: {
          name: true,
          bio: true,
          avatar: true,
        },
      },
    },
  });

  if (!pub) {
    notFound();
  }

  // 2. Fetch Posts belonging to this publication
  const posts = await db.post.findMany({
    where: {
      publicationId: pub.id,
      status: "PUBLISHED",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 3. Get session user and check if already subscribed
  const user = await getSessionUser();
  let isSubscribed = false;
  let userEmail = "";

  if (user) {
    userEmail = user.email;
    const subscription = await db.subscription.findUnique({
      where: {
        userId_publicationId: {
          userId: user.id,
          publicationId: pub.id,
        },
      },
    });
    isSubscribed = !!subscription;
  }

  return (
    <div className={styles.container}>
      {/* Back to Discover link */}
      <Link href="/" className="btn btn-text" style={{ alignSelf: "flex-start", marginTop: "24px", paddingLeft: 0, gap: "4px" }}>
        <ArrowLeft size={16} /> Back to Discover
      </Link>

      {/* Publication Cover */}
      {pub.cover && (
        <div className={styles.coverContainer}>
          <img src={pub.cover} alt="" className={styles.coverImage} />
        </div>
      )}

      {/* Header Info */}
      <div className={styles.pubHeader}>
        <div className={styles.logo}>{pub.logo || "✍️"}</div>
        <h1 className={`${styles.title} serif-title`}>{pub.title}</h1>
        <p className={styles.description}>{pub.description}</p>
        
        <div className={styles.authorInfo}>
          <img src={pub.writer.avatar || ""} alt="" className={styles.authorAvatar} />
          <span>Published by <strong className={styles.authorName}>{pub.writer.name}</strong></span>
        </div>
      </div>

      {/* Inline Subscribe Box */}
      <SubscribeWidget
        pubId={pub.id}
        pubTitle={pub.title}
        pubLogo={pub.logo || "✍️"}
        pubSlug={pub.slug}
        isSubscribedInitially={isSubscribed}
        userEmail={userEmail}
      />

      {/* Archive Section */}
      <section>
        <h2 className={styles.archiveHeader}>Archive Feed</h2>
        
        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-secondary)" }}>
            <Mail size={32} style={{ color: "var(--text-muted)", marginBottom: "12px" }} />
            <p>No articles published yet. Stay tuned!</p>
          </div>
        ) : (
          <div className={styles.postsList}>
            {posts.map((post) => (
              <article key={post.id} className={styles.postItem}>
                <div className={styles.postContent}>
                  <div>
                    <Link href={`/p/${pub.slug}/${post.slug}`}>
                      <h3 className={styles.postItemTitle}>{post.title}</h3>
                    </Link>
                    <p className={styles.postExcerpt}>{post.excerpt}</p>
                  </div>
                  
                  <div className={styles.postMeta}>
                    <span>{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    <span>•</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} /> {Math.ceil(post.content.split(/\s+/).length / 200)} min read
                    </span>
                    {post.visibility === "PREMIUM" && (
                      <span className={styles.badgePremium}>PREMIUM</span>
                    )}
                  </div>
                </div>

                {post.coverImage && (
                  <div className={styles.postImageWrapper}>
                    <img src={post.coverImage} alt="" className={styles.postImage} />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Subscribe Modal Triggered via URL query param */}
      {subscribe === "true" && (
        <ModalCloseWrapper
          pubId={pub.id}
          pubTitle={pub.title}
          pubLogo={pub.logo || "✍️"}
          pubSlug={pub.slug}
          isSubscribedInitially={isSubscribed}
          userEmail={userEmail}
        />
      )}
    </div>
  );
}
