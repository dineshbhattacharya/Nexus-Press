import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { 
  Users, Eye, Heart, DollarSign, Edit, Trash2, PlusCircle, 
  Settings, BookOpen, MessageCircle 
} from "lucide-react";
import SubscriberChart from "@/components/SubscriberChart";
import DeletePostButton from "@/components/DeletePostButton";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function WriterDashboard() {
  const user = await getSessionUser();

  // Protect route
  if (!user) {
    redirect("/login");
  }

  // Fetch writer's publication
  const pub = await db.publication.findFirst({
    where: { writerId: user.id },
  });

  // If no publication setup, redirect to onboarding creation
  if (!pub) {
    redirect("/register?setup_pub=true");
  }

  // Fetch subscriber count metrics
  const totalSubscribers = await db.subscription.count({
    where: { publicationId: pub.id },
  });

  const premiumSubscribers = await db.subscription.count({
    where: { publicationId: pub.id, tier: "PREMIUM" },
  });

  // Fetch all posts with their likes and comments counts
  const posts = await db.post.findMany({
    where: { publicationId: pub.id },
    include: {
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Aggregated Stats
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
  const totalLikes = posts.reduce((sum, p) => sum + p._count.likes, 0);
  const estimatedRevenue = premiumSubscribers * 5; // $5 per premium subscriber

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>{pub.title} Dashboard</h1>
          <p className={styles.subtitle}>Manage your writing, analyze subscriber growth, and publish newsletters.</p>
        </div>
        <Link href="/dashboard/new" className="btn btn-primary" style={{ gap: "6px" }}>
          <PlusCircle size={18} /> New Article
        </Link>
      </header>

      <div className={styles.shell}>
        {/* Sidebar Controls */}
        <aside className={styles.sidebar}>
          <Link href="/dashboard" className={`${styles.sidebarLink} ${styles.sidebarLinkActive}`}>
            <BookOpen size={16} /> Overview
          </Link>
          <Link href="/dashboard/subscribers" className={styles.sidebarLink}>
            <Users size={16} /> Subscribers
          </Link>
          <a href={`/p/${pub.slug}`} target="_blank" className={styles.sidebarLink}>
            <Settings size={16} /> View Site
          </a>
        </aside>

        {/* Main Content Area */}
        <main>
          {/* Stats Grid */}
          <section className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Subscribers</span>
                <span className={styles.statValue}>{totalSubscribers}</span>
              </div>
              <div className={styles.statIconWrapper}>
                <Users size={20} />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Total Views</span>
                <span className={styles.statValue}>{totalViews}</span>
              </div>
              <div className={styles.statIconWrapper}>
                <Eye size={20} />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Likes</span>
                <span className={styles.statValue}>{totalLikes}</span>
              </div>
              <div className={styles.statIconWrapper}>
                <Heart size={20} />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Monthly Rev.</span>
                <span className={styles.statValue}>${estimatedRevenue}</span>
              </div>
              <div className={styles.statIconWrapper}>
                <DollarSign size={20} />
              </div>
            </div>
          </section>

          {/* Growth Analytics Chart */}
          <section className={styles.chartCard}>
            <h3 className={styles.chartHeader}>Subscriber Growth Curve</h3>
            <SubscriberChart />
          </section>

          {/* Articles List */}
          <section className={styles.postsSection}>
            <h3 className={styles.sectionHeader}>Articles ({posts.length})</h3>

            {posts.length === 0 ? (
              <div className={styles.emptyState}>
                <p>You haven't written any articles yet. Create your first draft!</p>
                <Link href="/dashboard/new" className="btn btn-secondary" style={{ marginTop: "16px" }}>
                  Write Draft
                </Link>
              </div>
            ) : (
              <div className={styles.postsList}>
                {posts.map((post) => (
                  <div key={post.id} className={styles.postRow}>
                    <div className={styles.postInfo}>
                      <span className={styles.postTitle}>{post.title}</span>
                      <div className={styles.postMeta}>
                        <span>{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        <span>•</span>
                        {post.status === "PUBLISHED" ? (
                          <span className={styles.badgePublished}>Published</span>
                        ) : (
                          <span className={styles.badgeDraft}>Draft</span>
                        )}
                        <span>•</span>
                        <span style={{ textTransform: "capitalize" }}>{post.visibility.toLowerCase()} access</span>
                      </div>
                    </div>

                    <div className={styles.postStats}>
                      <span className={styles.statItem} title="Views">
                        <Eye size={14} style={{ color: "var(--text-muted)" }} /> {post.views}
                      </span>
                      <span className={styles.statItem} title="Likes">
                        <Heart size={14} style={{ color: "var(--text-muted)" }} /> {post._count.likes}
                      </span>
                      <span className={styles.statItem} title="Comments">
                        <MessageCircle size={14} style={{ color: "var(--text-muted)" }} /> {post._count.comments}
                      </span>
                    </div>

                    <div className={styles.postActions}>
                      <Link 
                        href={`/dashboard/edit/${post.id}`} 
                        className={`${styles.btnAction} btn btn-secondary`}
                        title="Edit Article"
                      >
                        <Edit size={14} />
                      </Link>
                      {/* Delete button (Client Component) */}
                      <DeletePostButton postId={post.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
