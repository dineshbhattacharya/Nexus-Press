"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Feather, BookOpen, User as UserIcon, LogOut, ChevronDown, PenTool, LayoutDashboard } from "lucide-react";
import styles from "./Navigation.module.css";

interface NavigationProps {
  initialUser?: any;
}

export default function Navigation({ initialUser }: NavigationProps) {
  const [user, setUser] = useState<any>(initialUser);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Polling/Syncing user session on navigate
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Failed to check session in nav:", err);
      }
    }
    
    // Check session on mount and when pathname changes
    checkSession();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        setDropdownOpen(false);
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Hide nav on dashboard editor pages for writing focus
  if (pathname.includes("/dashboard/edit") || pathname.includes("/dashboard/new")) {
    return null;
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.left}>
          <Link href="/" className={styles.logo}>
            <Feather className={styles.logoIcon} />
            <span className={styles.logoText}>Nexus<span className={styles.logoHighlight}>Press</span></span>
          </Link>
          <nav className={styles.navLinks}>
            <Link href="/" className={`${styles.navLink} ${pathname === "/" ? styles.active : ""}`}>
              Discover
            </Link>
            <Link href="/notes" className={`${styles.navLink} ${pathname === "/notes" ? styles.active : ""}`}>
              Notes Feed
            </Link>
          </nav>
        </div>

        <div className={styles.right}>
          {user ? (
            <div className={styles.userSection}>
              {user.publications?.length > 0 ? (
                <Link href="/dashboard" className={`${styles.btnDashboard} btn btn-secondary`}>
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link href="/register?setup_pub=true" className={`${styles.btnDashboard} btn btn-secondary`}>
                  <PenTool size={16} />
                  <span>Start Publishing</span>
                </Link>
              )}

              <div className={styles.avatarWrapper}>
                <button 
                  className={styles.avatarButton} 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-label="User menu"
                >
                  <img 
                    src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.email)}`} 
                    alt={user.name || "Avatar"} 
                    className={styles.avatarImg}
                  />
                  <ChevronDown size={14} className={styles.chevron} />
                </button>

                {dropdownOpen && (
                  <>
                    <div className={styles.dropdownOverlay} onClick={() => setDropdownOpen(false)} />
                    <div className={styles.dropdown}>
                      <div className={styles.dropdownHeader}>
                        <div className={styles.dropdownName}>{user.name}</div>
                        <div className={styles.dropdownEmail}>{user.email}</div>
                      </div>
                      
                      {user.publications?.length > 0 && (
                        <Link 
                          href="/dashboard" 
                          className={styles.dropdownItem}
                          onClick={() => setDropdownOpen(false)}
                        >
                          <LayoutDashboard size={16} />
                          Writer Dashboard
                        </Link>
                      )}

                      <Link 
                        href="/bookmarks" 
                        className={styles.dropdownItem}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <BookOpen size={16} />
                        My Library
                      </Link>

                      <hr className={styles.divider} />
                      
                      <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.btnLogout}`}>
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.authActions}>
              <Link href="/login" className={styles.loginLink}>
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
