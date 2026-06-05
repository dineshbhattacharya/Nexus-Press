"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CreditCard, Check, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import styles from "@/app/p/[pubSlug]/checkout/page.module.css";

interface CheckoutClientProps {
  pubId: string;
  pubTitle: string;
  pubLogo: string;
  pubSlug: string;
  initialUser: any;
}

export default function CheckoutClient({
  pubId,
  pubTitle,
  pubLogo,
  pubSlug,
  initialUser,
}: CheckoutClientProps) {
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [email, setEmail] = useState(initialUser?.email || "");
  const [name, setName] = useState(initialUser?.name || "");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Formatting utility for card number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\s/g, "");
    if (/^\d*$/.test(val)) {
      if (val.length <= 16) {
        // Format with spaces
        let formatted = val.match(/.{1,4}/g)?.join(" ") || "";
        setCardNumber(formatted);
      }
    }
  };

  // Formatting utility for expiry
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length <= 4) {
      if (val.length > 2) {
        setExpiry(`${val.slice(0, 2)}/${val.slice(2)}`);
      } else {
        setExpiry(val);
      }
    }
  };

  // Formatting utility for CVC
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length <= 3) {
      setCvc(val);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/publications/${pubId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          cardNumber,
          expiry,
          cvc,
          plan,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Payment failed. Please verify card details.");
      }
    } catch (err) {
      setError("Unable to process checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.successView}>
          <CheckCircle2 size={64} className={styles.successIcon} />
          <h2 className={styles.successTitle}>Subscription Confirmed!</h2>
          <p className={styles.successText}>
            Thank you for subscribing to <strong>{pubTitle}</strong> premium tier. 
            You now have unlocked full access to all articles, comments, and archives.
          </p>
          <Link href={`/p/${pubSlug}`} className="btn btn-primary">
            Start Reading Premium content
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href={`/p/${pubSlug}`} className={styles.backLink}>
        <ArrowLeft size={16} /> Back to publication
      </Link>

      <div className={styles.titleSection}>
        <div className={styles.logo}>{pubLogo}</div>
        <h1 className={styles.title}>Unlock Premium Access</h1>
        <p className={styles.subtitle}>
          Support {pubTitle} and get complete access to exclusive deep dives.
        </p>
      </div>

      {/* Plans selector */}
      <div className={styles.plansGrid}>
        <div 
          onClick={() => setPlan("monthly")}
          className={`${styles.planCard} ${plan === "monthly" ? styles.planCardSelected : ""}`}
        >
          <div className={styles.planSelector}>
            {plan === "monthly" && <div className={styles.planSelectorInner} />}
          </div>
          <h3 className={styles.planTitle}>Monthly</h3>
          <div className={styles.planPrice}>
            $5<span>/month</span>
          </div>
          <ul className={styles.planFeatures}>
            <li><Check size={14} style={{ color: "var(--accent-orange)" }} /> Full exclusive posts</li>
            <li><Check size={14} style={{ color: "var(--accent-orange)" }} /> Premium comments</li>
            <li><Check size={14} style={{ color: "var(--accent-orange)" }} /> Support the writer</li>
          </ul>
        </div>

        <div 
          onClick={() => setPlan("yearly")}
          className={`${styles.planCard} ${plan === "yearly" ? styles.planCardSelected : ""}`}
        >
          <div className={styles.planSelector}>
            {plan === "yearly" && <div className={styles.planSelectorInner} />}
          </div>
          <h3 className={styles.planTitle}>Annual</h3>
          <div className={styles.planPrice}>
            $50<span>/year</span>
          </div>
          <span className={styles.planSavings}>Save 17%</span>
          <ul className={styles.planFeatures}>
            <li><Check size={14} style={{ color: "var(--accent-orange)" }} /> Full exclusive posts</li>
            <li><Check size={14} style={{ color: "var(--accent-orange)" }} /> Premium comments</li>
            <li><Check size={14} style={{ color: "var(--accent-orange)" }} /> Support the writer</li>
          </ul>
        </div>
      </div>

      {/* Credit Card visual mockup */}
      <div className={styles.cardMockup}>
        <div className={styles.cardChip} />
        <div className={styles.cardNumber}>
          {cardNumber || "•••• •••• •••• ••••"}
        </div>
        <div className={styles.cardBottom}>
          <div>
            <div style={{ fontSize: "0.6rem", opacity: 0.8, marginBottom: "4px" }}>CARDHOLDER</div>
            <div className={styles.cardName}>{name || "YOUR NAME"}</div>
          </div>
          <div className={styles.cardExpiry}>
            <div style={{ fontSize: "0.6rem", opacity: 0.8, marginBottom: "4px" }}>EXPIRES</div>
            <div>{expiry || "MM/YY"}</div>
          </div>
        </div>
      </div>

      {/* Checkout Form */}
      <div className={styles.formSection}>
        <h3 className={styles.formTitle}>Billing Details</h3>
        <form onSubmit={handleCheckout} className={styles.formGrid}>
          {/* Email (only editable if not logged in) */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={styles.input}
              disabled={!!initialUser || loading}
              required
            />
          </div>

          {/* Name on Card */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Name on Card</label>
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

          {/* Credit Card inputs */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Card Number</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="4111 2222 3333 4444"
                className={styles.input}
                style={{ width: "100%", paddingRight: "40px" }}
                disabled={loading}
                required
              />
              <CreditCard size={18} style={{ position: "absolute", right: "14px", top: "14px", color: "var(--text-muted)" }} />
            </div>
          </div>

          {/* Expiry and CVC */}
          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Expiry Date</label>
              <input
                type="text"
                value={expiry}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                className={styles.input}
                disabled={loading}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>CVC</label>
              <input
                type="text"
                value={cvc}
                onChange={handleCvcChange}
                placeholder="123"
                className={styles.input}
                disabled={loading}
                required
              />
            </div>
          </div>

          {error && <p style={{ fontSize: "0.85rem", color: "#ef4444", marginTop: "8px" }}>{error}</p>}

          <button type="submit" className={`${styles.btnSubmit} btn btn-primary`} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Upgrading...
              </>
            ) : (
              `Subscribe for $${plan === "monthly" ? "5" : "50"}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
