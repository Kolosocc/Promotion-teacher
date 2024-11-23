"use client";
import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import useUserData from "@/hooks/useUserData";
import styles from "./Header.module.scss";

const Header = () => {
  const { user, userRole, userData, loading } = useUserData();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Изначально меню скрыто

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev); // Переключение состояния меню
  };

  if (loading) return <div className={styles.loading}>Загрузка...</div>;

  return (
    <header className={styles.header}>
      {/* Кнопка бургера, отображается только на мобильных устройствах */}
      <button className="sm:hidden" onClick={toggleMenu}>
        <div className={styles.burherMenuIcon} aria-label="Burger Menu" />
      </button>

      {/* Навигация */}
      <nav className={`${styles.nav} ${isMenuOpen ? styles.open : ""}`}>
        <Link href="/" className={styles.navLink}>
          Home
        </Link>
        <Link href="/teachers" className={styles.navLink}>
          Teachers
        </Link>
        <Link href="/chat" className={styles.navLink}>
          Chat
        </Link>

        {userRole === "admin" && (
          <Link href="/addTeacher" className={styles.navLink}>
            addTeacher Admin
          </Link>
        )}
      </nav>

      <div className={styles.userInfo}>
        {!user ? (
          <>
            <Link href="/login" className={styles.navLink}>
              Login
            </Link>
            <Link href="/register" className={styles.navLink}>
              Register
            </Link>
          </>
        ) : (
          <div className={styles.userInfo}>
            <div className={styles.userDetails}>
              <span>{userData?.name || user.displayName || "User"}</span>
              {userData?.avatar ? (
                <img
                  src={userData.avatar}
                  alt={userData.name || "User avatar"}
                  className={styles.userAvatar}
                />
              ) : (
                user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User avatar"}
                    className={styles.userAvatar}
                  />
                )
              )}
            </div>

            <button onClick={handleSignOut} className={styles.signOutButton}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
