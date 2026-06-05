import React from "react";
import Link from "next/link";
import { Feather } from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.info}>
            <div className={styles.logo}>
              <Feather className={styles.logoIcon} />
              <span>Nexus<span className={styles.logoHighlight}>Press</span></span>
            </div>
            <p className={styles.description}>
              A premium, full-stack publishing ecosystem for independent writers and curious readers.
            </p>
          </div>
          <div className={styles.linksGroup}>
            <div className={styles.linksColumn}>
              <h4 className={styles.title}>Explore</h4>
              <Link href="/" className={styles.link}>Discover Writers</Link>
              <Link href="/notes" className={styles.link}>Nexus Notes Feed</Link>
            </div>
            <div className={styles.linksColumn}>
              <h4 className={styles.title}>Publishing</h4>
              <Link href="/register?setup_pub=true" className={styles.link}>Create Publication</Link>
              <Link href="/dashboard" className={styles.link}>Writer Portal</Link>
            </div>
          </div>
        </div>
        <hr className={styles.divider} />
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} NexusPress. All rights reserved. Designed with visual excellence.
          </p>
          <div className={styles.badge}>
            Resume Edition
          </div>
        </div>
      </div>
    </footer>
  );
}
