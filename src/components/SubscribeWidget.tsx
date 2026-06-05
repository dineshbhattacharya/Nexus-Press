"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, CheckCircle, Mail, Loader2 } from "lucide-react";
import styles from "@/app/p/[pubSlug]/page.module.css";

interface SubscribeWidgetProps {
  pubId: string;
  pubTitle: string;
  pubLogo: string;
  pubSlug: string;
  isSubscribedInitially?: boolean;
  userEmail?: string;
  openAsModal?: boolean;
  onCloseModal?: () => void;
}

export default function SubscribeWidget({
  pubId,
  pubTitle,
  pubLogo,
  pubSlug,
  isSubscribedInitially = false,
  userEmail = "",
  openAsModal = false,
  onCloseModal,
}: SubscribeWidgetProps) {
  const [email, setEmail] = useState(userEmail);
  const [isSubscribed, setIsSubscribed] = useState(isSubscribedInitially);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/publications/${pubId}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSubscribed(true);
        setSuccess(true);
        router.refresh();
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isSubscribed && !success) {
    return (
      <div className={styles.subBox}>
        <CheckCircle size={36} style={{ color: "var(--accent-orange)", margin: "0 auto 12px auto" }} />
        <h3 className={styles.subTitle}>You're Subscribed!</h3>
        <p className={styles.subText}>
          You are currently receiving email updates from <strong>{pubTitle}</strong>.
        </p>
      </div>
    );
  }

  if (openAsModal) {
    return (
      <div className={styles.modalOverlay} onClick={onCloseModal}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <button className={styles.closeButton} onClick={onCloseModal}>
            <X size={20} />
          </button>

          {success ? (
            <div className={styles.subSuccess}>
              <CheckCircle size={48} style={{ color: "var(--accent-orange)" }} />
              <h3 className={styles.successTitle}>Welcome to the fold!</h3>
              <p className={styles.successText}>
                You are now subscribed to <strong>{pubTitle}</strong>.
              </p>
              <button onClick={onCloseModal} className="btn btn-primary" style={{ width: "100%" }}>
                Start Reading
              </button>
            </div>
          ) : (
            <>
              <div className={styles.modalLogo}>{pubLogo}</div>
              <h3 className={styles.modalTitle}>Subscribe to {pubTitle}</h3>
              <p className={styles.modalDesc}>
                Get latest articles and premium deep-dives delivered straight to your inbox.
              </p>

              <form onSubmit={handleSubscribe} className={styles.subForm} style={{ flexDirection: "column", gap: "12px" }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className={styles.subInput}
                  disabled={loading}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Subscribe"}
                </button>
                {error && <p style={{ fontSize: "0.8rem", color: "#ef4444", marginTop: "4px" }}>{error}</p>}
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.subBox}>
      {success ? (
        <div className={styles.subSuccess}>
          <CheckCircle size={40} style={{ color: "var(--accent-orange)" }} />
          <h3 className={styles.successTitle}>Thanks for subscribing!</h3>
          <p className={styles.successText}>
            You will now receive notifications from <strong>{pubTitle}</strong>.
          </p>
        </div>
      ) : (
        <>
          <h3 className={styles.subTitle}>Subscribe to {pubTitle}</h3>
          <p className={styles.subText}>
            Join the community and stay updated with essays, analysis, and ideas.
          </p>
          <form onSubmit={handleSubscribe} className={styles.subForm}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className={styles.subInput}
              disabled={loading}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Subscribe"}
            </button>
          </form>
          {error && <p style={{ fontSize: "0.85rem", color: "#ef4444", marginTop: "12px" }}>{error}</p>}
        </>
      )}
    </div>
  );
}
