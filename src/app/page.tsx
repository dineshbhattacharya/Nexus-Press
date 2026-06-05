import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { Search, TrendingUp, BookOpen, Clock, ArrowRight, Star } from "lucide-react";
import styles from "./page.module.css";

interface PageProps {
  searchParams: Promise<{ q?: string; tag?: string }>;
}

export default async function DiscoverPage({ searchParams }: PageProps) {
  // Await searchParams in Next.js 15
  const params = await searchParams;
  const searchQuery = params.q || "";
  const activeTag = params.tag || "";

  // 1. Fetch Publications (Featured Writers)
  const publications = await db.publication.findMany({
    include: {
      writer: {
        select: {
          name: true,
          bio: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          subscriptions: true,
        },
      },
    },
    take: 3,
  });

  // 2. Fetch Trending Posts (ordered by views)
  const trendingPosts = await db.post.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      publication: {
        select: {
          title: true,
          slug: true,
          logo: true,
        },
      },
    },
    orderBy: {
      views: "desc",
    },
    take: 3,
  });

  // 3. Fetch Recent Feed Posts (filtered by search and active publication tag)
  const feedPosts = await db.post.findMany({
    where: {
      status: "PUBLISHED",
      OR: searchQuery
        ? [
            { title: { contains: searchQuery } },
            { excerpt: { contains: searchQuery } },
            { content: { contains: searchQuery } },
          ]
        : undefined,
      publication: activeTag
        ? {
            slug: activeTag,
          }
        : undefined,
    },
    include: {
      publication: {
        select: {
          title: true,
          slug: true,
          logo: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
  });

  // 4. Fetch recent short-form notes for sidebar
  const sidebarNotes = await db.note.findMany({
    include: {
      user: {
        select: {
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
  });

  return (
    <div className={styles.container}>
      {/* Hero Header */}
      <section className={styles.hero}>
        <h1 className={`${styles.heroTitle} serif-title`}>
          Publish your passion.<br />Discover your obsession.
        </h1>
        <p className={styles.heroSubtitle}>
          Write, share, and monetize your newsletters with a glassmorphic, AI-accelerated reading experience.
        </p>

        {/* Search Bar */}
        <div className={styles.searchWrapper}>
          <form action="/" method="GET" className={styles.searchForm}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search articles, authors, or topics..."
              className={styles.searchInput}
            />
            {activeTag && <input type="hidden" name="tag" value={activeTag} />}
            <button type="submit" className={`btn btn-primary ${styles.searchButton}`}>
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Category Tabs */}
      <section className={styles.categories}>
        <Link 
          href="/" 
          className={`${styles.categoryTag} ${!activeTag ? styles.categoryTagActive : ""}`}
        >
          All
        </Link>
        <Link 
          href="/?tag=cosmic" 
          className={`${styles.categoryTag} ${activeTag === "cosmic" ? styles.categoryTagActive : ""}`}
        >
          Space & Tech
        </Link>
        <Link 
          href="/?tag=markets" 
          className={`${styles.categoryTag} ${activeTag === "markets" ? styles.categoryTagActive : ""}`}
        >
          Finance & Minds
        </Link>
        <Link 
          href="/?tag=scribe" 
          className={`${styles.categoryTag} ${activeTag === "scribe" ? styles.categoryTagActive : ""}`}
        >
          Creative Writing
        </Link>
      </section>

      {/* Trending Posts */}
      {!searchQuery && !activeTag && (
        <section className={styles.trendingSection}>
          <h2 className={styles.sectionHeader}>
            <TrendingUp size={22} className={styles.sectionHeaderIcon} />
            Trending on NexusPress
          </h2>
          <div className={styles.trendingGrid}>
            {trendingPosts.map((post, idx) => (
              <div key={post.id} className={`${styles.trendingCard} card`}>
                <span className={styles.trendingNumber}>0{idx + 1}</span>
                <div className={styles.trendingContent}>
                  <Link href={`/p/${post.publication.slug}`} className={styles.trendingPub}>
                    {post.publication.logo} {post.publication.title}
                  </Link>
                  <Link href={`/p/${post.publication.slug}/${post.slug}`}>
                    <h3 className={styles.trendingTitle}>{post.title}</h3>
                  </Link>
                  <div className={styles.trendingMeta}>
                    <span>{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    <span>•</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                      <Clock size={12} /> {Math.ceil(post.content.split(/\s+/).length / 200)} min read
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Writers */}
      {!searchQuery && !activeTag && (
        <section className={styles.writersSection}>
          <h2 className={styles.sectionHeader}>
            <Star size={22} className={styles.sectionHeaderIcon} />
            Featured Publications
          </h2>
          <div className={styles.writersGrid}>
            {publications.map((pub) => (
              <div key={pub.id} className={`${styles.writerCard} card`}>
                <img src={pub.cover || ""} alt="" className={styles.writerCover} />
                <div className={styles.writerLogo}>{pub.logo}</div>
                <h3 className={styles.writerTitle}>{pub.title}</h3>
                <div className={styles.writerName}>by {pub.writer.name}</div>
                <p className={styles.writerDesc}>{pub.writer.bio || pub.description}</p>
                <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "auto" }}>
                  <Link href={`/p/${pub.slug}`} className={`${styles.btnSubscribe} btn btn-secondary`}>
                    Read Archive
                  </Link>
                  <Link href={`/p/${pub.slug}?subscribe=true`} className={`${styles.btnSubscribe} btn btn-primary`}>
                    Subscribe
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Feed Content */}
      <div className={styles.feedLayout}>
        {/* Posts Columns */}
        <section>
          <h2 className={styles.feedTitle}>
            {searchQuery ? `Search Results for "${searchQuery}"` : activeTag ? `Latest in ${activeTag.toUpperCase()}` : "Latest Publications"}
          </h2>
          
          {feedPosts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>
              <BookOpen size={40} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
              <p>No articles found. Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className={styles.postsList}>
              {feedPosts.map((post) => (
                <article key={post.id} className={styles.postItem}>
                  <div className={styles.postItemContent}>
                    <div className={styles.postHeader}>
                      <Link href={`/p/${post.publication.slug}`} className={styles.postPubBadge}>
                        <span className={styles.pubLogo}>{post.publication.logo}</span>
                        {post.publication.title}
                      </Link>
                      <Link href={`/p/${post.publication.slug}/${post.slug}`}>
                        <h3 className={styles.postTitle}>{post.title}</h3>
                      </Link>
                      <p className={styles.postExcerpt}>{post.excerpt}</p>
                    </div>

                    <div className={styles.postMeta}>
                      <div className={styles.postMetaLeft}>
                        <span>{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        <span>•</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={12} /> {Math.ceil(post.content.split(/\s+/).length / 200)} min read
                        </span>
                        {post.visibility === "PREMIUM" ? (
                          <span className={styles.badgePremium}>PREMIUM</span>
                        ) : (
                          <span className={styles.badgeFree}>FREE</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {post.coverImage && (
                    <div className={styles.postImgWrapper}>
                      <img src={post.coverImage} alt="" className={styles.postImg} />
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarWidget}>
            <h3 className={styles.widgetTitle}>Community Notes</h3>
            <div className={styles.sidebarNotesList}>
              {sidebarNotes.map((note) => (
                <div key={note.id} className={styles.sidebarNoteItem}>
                  <div className={styles.noteHeader}>
                    <img 
                      src={note.user.avatar || ""} 
                      alt="" 
                      className={styles.noteAvatar}
                    />
                    <span className={styles.noteAuthor}>{note.user.name}</span>
                  </div>
                  <p className={styles.noteText}>{note.content}</p>
                  <div className={styles.noteTime}>
                    {new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              ))}
            </div>
            <Link 
              href="/notes" 
              className="btn btn-text" 
              style={{ display: "flex", width: "100%", justifyContent: "center", marginTop: "16px", fontSize: "0.85rem" }}
            >
              Go to Notes Feed <ArrowRight size={14} style={{ marginLeft: "4px" }} />
            </Link>
          </div>
          
          <div className={styles.sidebarWidget} style={{ background: "radial-gradient(circle at 100% 0%, var(--accent-orange-light) 0%, transparent 100%)" }}>
            <h3 className={styles.widgetTitle}>Ready to write?</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "16px" }}>
              Join hundreds of writers who share their expertise, build communities, and launch newsletters.
            </p>
            <Link href="/register?setup_pub=true" className="btn btn-primary" style={{ width: "100%" }}>
              Start Writing
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
