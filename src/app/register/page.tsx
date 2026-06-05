"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Feather, Loader2, ArrowRight } from "lucide-react";
import styles from "@/app/login/page.module.css";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setupPubQuery = searchParams.get("setup_pub") === "true";

  // Account Mode: reader vs writer
  const [mode, setMode] = useState<"reader" | "writer">(setupPubQuery ? "writer" : "reader");

  // User details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");

  // Publication details (only for writer mode)
  const [pubTitle, setPubTitle] = useState("");
  const [pubSlug, setPubSlug] = useState("");
  const [pubDesc, setPubDesc] = useState("");

  // Form handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync mode if query params change
  useEffect(() => {
    if (setupPubQuery) {
      setMode("writer");
    }
  }, [setupPubQuery]);

  // Auto-generate slug from publication title
  useEffect(() => {
    if (pubTitle) {
      const generatedSlug = pubTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 30);
      setPubSlug(generatedSlug);
    }
  }, [pubTitle]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || loading) return;

    setLoading(true);
    setError("");

    const payload: any = {
      name,
      email,
      password,
      bio: bio || (mode === "writer" ? "Writer on NexusPress" : "Reader on NexusPress"),
    };

    if (mode === "writer") {
      if (!pubTitle || !pubSlug) {
        setError("Publication Title and Web Slug are required for writers.");
        setLoading(false);
        return;
      }
      payload.publicationTitle = pubTitle;
      payload.publicationSlug = pubSlug;
      payload.publicationDescription = pubDesc;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (mode === "writer") {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
        router.refresh();
      } else {
        setError(data.error || "Onboarding failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.card} ${mode === "writer" ? styles.cardSetupPub : ""}`}>
      <div className={styles.logoArea}>
        <Feather className={styles.logoIcon} size={40} />
        <h2 className={styles.title}>Create your account</h2>
        <p className={styles.subtitle}>Start reading or publishing on NexusPress.</p>
      </div>

      {/* Tab mode toggles */}
      {!setupPubQuery && (
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabButton} ${mode === "reader" ? styles.tabButtonActive : ""}`}
            onClick={() => setMode("reader")}
          >
            Reader Account
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${mode === "writer" ? styles.tabButtonActive : ""}`}
            onClick={() => setMode("writer")}
          >
            Writer / Publisher
          </button>
        </div>
      )}

      <form onSubmit={handleRegister} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className={styles.input}
            disabled={loading}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className={styles.input}
            disabled={loading}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={styles.input}
            disabled={loading}
            required
          />
        </div>

        {mode === "writer" && (
          <>
            <h3 className={styles.setupTitle}>Setup Publication Brand</h3>
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Publication Name</label>
              <input
                type="text"
                value={pubTitle}
                onChange={(e) => setPubTitle(e.target.value)}
                placeholder="E.g., The Tech Ledger"
                className={styles.input}
                disabled={loading}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Publication URL Slug</label>
              <div className={styles.slugWrapper}>
                <span className={styles.slugPrefix}>nexuspress.com/p/</span>
                <input
                  type="text"
                  value={pubSlug}
                  onChange={(e) => setPubSlug(e.target.value)}
                  placeholder="tech-ledger"
                  className={styles.slugInput}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>One-line Bio / Description</label>
              <textarea
                value={pubDesc}
                onChange={(e) => setPubDesc(e.target.value)}
                placeholder="E.g., Explaining technical engineering topics in plain English."
                className={styles.textarea}
                disabled={loading}
              />
            </div>
          </>
        )}

        {error && <div className={styles.errorBox}>{error}</div>}

        <button type="submit" className={`${styles.btnSubmit} btn btn-primary`} disabled={loading}>
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              {mode === "writer" ? "Create Brand & Continue" : "Create Account"}{" "}
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className={styles.footer}>
        Already have an account?{" "}
        <Link href="/login" className={styles.footerLink}>
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={
        <div className={styles.card} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
          <Loader2 size={36} className="animate-spin" style={{ color: "var(--accent-orange)" }} />
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
