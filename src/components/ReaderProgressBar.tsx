"use client";

import React, { useState, useEffect } from "react";
import styles from "@/app/p/[pubSlug]/[postSlug]/page.module.css";

export default function ReaderProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      className={styles.progressBar} 
      style={{ width: `${scrollProgress}%` }} 
    />
  );
}
