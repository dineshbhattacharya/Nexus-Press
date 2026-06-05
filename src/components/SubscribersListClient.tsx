"use client";

import React, { useState } from "react";
import { Search, Mail } from "lucide-react";
import styles from "@/app/dashboard/subscribers/page.module.css";

interface Subscription {
  id: string;
  tier: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
    avatar: string | null;
  };
}

interface SubscribersListClientProps {
  subscriptions: Subscription[];
}

export default function SubscribersListClient({ subscriptions }: SubscribersListClientProps) {
  const [search, setSearch] = useState("");

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const term = search.toLowerCase();
    const name = sub.user.name?.toLowerCase() || "";
    const email = sub.user.email.toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  return (
    <>
      {/* Search Input */}
      <div className={styles.searchBar}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subscribers by name or email..."
          className={styles.searchInput}
        />
      </div>

      {/* Subscribers Table Card */}
      <div className={styles.tableCard}>
        {filteredSubscriptions.length === 0 ? (
          <div className={styles.emptyState}>
            <Mail size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px auto" }} />
            <p>No subscribers found matching "{search}"</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Subscriber</th>
                  <th className={styles.th}>Tier</th>
                  <th className={styles.th}>Subscribed On</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className={styles.row}>
                    <td className={styles.td}>
                      <div className={styles.subscriberInfo}>
                        <img
                          src={sub.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(sub.user.email)}`}
                          alt=""
                          className={styles.avatar}
                        />
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span className={styles.subName}>{sub.user.name || "Anonymous Reader"}</span>
                          <span className={styles.subEmail}>{sub.user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className={styles.td}>
                      {sub.tier === "PREMIUM" ? (
                        <span className={styles.badgePremium}>PREMIUM</span>
                      ) : (
                        <span className={styles.badgeFree}>FREE</span>
                      )}
                    </td>
                    <td className={styles.td}>
                      {new Date(sub.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
