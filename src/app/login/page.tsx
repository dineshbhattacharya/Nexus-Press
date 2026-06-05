"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Feather, Loader2, ArrowRight } from "lucide-react";
import styles from "./page.module.css";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        setError(data.error || "Invalid email or password.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.logoArea}>
        <Feather className={styles.logoIcon} size={40} />
        <h2 className={styles.title}>Welcome Back</h2>
        <p className={styles.subtitle}>Sign in to manage your newsletter and feed.</p>
      </div>

      <form onSubmit={handleLogin} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
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

        {error && <div className={styles.errorBox}>{error}</div>}

        <button type="submit" className={`${styles.btnSubmit} btn btn-primary`} disabled={loading}>
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              Sign In <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className={styles.footer}>
        Don't have an account?{" "}
        <Link href="/register" className={styles.footerLink}>
          Get Started
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={
        <div className={styles.card} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
          <Loader2 size={36} className="animate-spin" style={{ color: "var(--accent-orange)" }} />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
