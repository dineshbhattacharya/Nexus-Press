import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { BookOpen, Users, Settings } from "lucide-react";
import SubscribersListClient from "@/components/SubscribersListClient";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function SubscribersDashboard() {
  const user = await getSessionUser();

  // Protect route
  if (!user) {
    redirect("/login");
  }

  // Fetch writer's publication
  const pub = await db.publication.findFirst({
    where: { writerId: user.id },
  });

  if (!pub) {
    redirect("/register?setup_pub=true");
  }

  // Fetch all subscriptions for this publication, joining user details
  const subscriptions = await db.subscription.findMany({
    where: { publicationId: pub.id },
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

  // Calculate totals
  const totalSubscribers = subscriptions.length;
  const premiumSubscribers = subscriptions.filter((sub) => sub.tier === "PREMIUM").length;
  const freeSubscribers = totalSubscribers - premiumSubscribers;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Subscribers Directory</h1>
          <p className={styles.subtitle}>View, search, and manage your readers and subscription levels.</p>
        </div>
      </header>

      <div className={styles.shell}>
        {/* Navigation Sidebar */}
        <aside className={styles.sidebar}>
          <Link href="/dashboard" className={styles.sidebarLink}>
            <BookOpen size={16} /> Overview
          </Link>
          <Link href="/dashboard/subscribers" className={`${styles.sidebarLink} ${styles.sidebarLinkActive}`}>
            <Users size={16} /> Subscribers
          </Link>
          <a href={`/p/${pub.slug}`} target="_blank" className={styles.sidebarLink}>
            <Settings size={16} /> View Site
          </a>
        </aside>

        {/* Main Dashboard Area */}
        <main>
          {/* Quick Stats Grid */}
          <section className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total Audience</span>
              <span className={styles.statValue}>{totalSubscribers}</span>
            </div>
            
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Premium Members</span>
              <span className={styles.statValue} style={{ color: "var(--accent-orange)" }}>
                {premiumSubscribers}
              </span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Free Newsletter readers</span>
              <span className={styles.statValue}>{freeSubscribers}</span>
            </div>
          </section>

          {/* Interactive Subscribers List */}
          <SubscribersListClient subscriptions={subscriptions} />
        </main>
      </div>
    </div>
  );
}
