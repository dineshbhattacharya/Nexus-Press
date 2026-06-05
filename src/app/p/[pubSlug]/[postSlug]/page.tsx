import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ArrowLeft, Clock, Lock, Sparkles } from "lucide-react";
import ReaderProgressBar from "@/components/ReaderProgressBar";
import EngagementPanel from "@/components/EngagementPanel";
import styles from "./page.module.css";

interface PostPageProps {
  params: Promise<{ pubSlug: string; postSlug: string }>;
}

export default async function ArticleReaderPage({ params }: PostPageProps) {
  const { pubSlug, postSlug } = await params;

  // 1. Fetch Post and Publication details
  const post = await db.post.findFirst({
    where: {
      slug: postSlug,
      publication: {
        slug: pubSlug,
      },
    },
    include: {
      publication: {
        include: {
          writer: {
            select: {
              id: true,
              name: true,
              bio: true,
              avatar: true,
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // 2. Increment view count
  await db.post.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  });

  // 3. Check session user and subscription level
  const user = await getSessionUser();
  let showPaywall = post.visibility === "PREMIUM";
  let isLiked = false;
  let isBookmarked = false;

  if (user) {
    // Check if user is the writer of this publication (always bypass paywall)
    if (user.id === post.publication.writerId) {
      showPaywall = false;
    } else {
      // Check if user is a premium subscriber
      const subscription = await db.subscription.findUnique({
        where: {
          userId_publicationId: {
            userId: user.id,
            publicationId: post.publication.id,
          },
        },
      });

      if (subscription && subscription.tier === "PREMIUM") {
        showPaywall = false;
      }
    }

    // Check if user liked this post
    const like = await db.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: post.id,
        },
      },
    });
    isLiked = !!like;

    // Check if user bookmarked this post
    const bookmark = await db.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: post.id,
        },
      },
    });
    isBookmarked = !!bookmark;
  }

  // Estimated reading time
  const wordCount = post.content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div className={styles.container}>
      {/* Scroll indicator */}
      <ReaderProgressBar />

      {/* Back to Publication */}
      <Link href={`/p/${pubSlug}`} className={styles.backLink}>
        <ArrowLeft size={16} /> Back to {post.publication.title}
      </Link>

      {/* Article Header */}
      <header>
        <h1 className={`${styles.title} serif-title`}>{post.title}</h1>
        
        <div className={styles.metaSection}>
          <div className={styles.authorCard}>
            <img 
              src={post.publication.writer.avatar || ""} 
              alt="" 
              className={styles.avatar} 
            />
            <div className={styles.authorDetails}>
              <span className={styles.authorName}>{post.publication.writer.name}</span>
              <Link href={`/p/${pubSlug}`} className={styles.pubLink}>
                {post.publication.logo} {post.publication.title}
              </Link>
            </div>
          </div>

          <div className={styles.metaRight}>
            <span>{new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Clock size={12} /> {readTime} min read
            </span>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className={styles.coverWrapper}>
          <img src={post.coverImage} alt="" className={styles.coverImage} />
        </div>
      )}

      {/* Article Content */}
      <article>
        {showPaywall ? (
          <>
            {/* Blurred Teaser Content */}
            <div className={styles.blurredContent}>
              <div 
                className={styles.articleBody} 
                dangerouslySetInnerHTML={{ __html: post.content.slice(0, 400) + "..." }} 
              />
            </div>

            {/* Paywall Sign-up Call-to-action */}
            <div className={styles.paywallBox}>
              <Lock size={36} className={styles.paywallIcon} />
              <h3 className={styles.paywallTitle}>This post is for premium subscribers</h3>
              <p className={styles.paywallText}>
                Subscribe to get full access to <strong>{post.publication.title}</strong>, 
                unlocking exclusive essays, analysis, archives, and the private writer community.
              </p>
              
              <div className={styles.paywallActions}>
                <Link href={`/p/${pubSlug}/checkout`} className="btn btn-primary">
                  Get Premium Access ($5/mo)
                </Link>
                <Link href={`/p/${pubSlug}?subscribe=true`} className="btn btn-secondary">
                  Join Free Newsletter
                </Link>
              </div>
            </div>
          </>
        ) : (
          /* Full Content */
          <div 
            className={styles.articleBody} 
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
        )}
      </article>

      {/* Floating Action/Engagement Bar */}
      <EngagementPanel
        postId={post.id}
        initialLikesCount={post._count.likes}
        initialLiked={isLiked}
        initialBookmarked={isBookmarked}
        initialCommentsCount={post._count.comments}
        postTitle={post.title}
        postContentHtml={post.content}
        currentUser={user}
      />
    </div>
  );
}
