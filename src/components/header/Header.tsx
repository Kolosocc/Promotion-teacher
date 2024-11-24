'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import useUserData from '@/hooks/useUserData'
import styles from './Header.module.scss'
import Image from 'next/image'

const Header = () => {
  const { user, userRole, userData, loading } = useUserData()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut(auth)
  }

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev)
  }

  if (loading) return <div className={styles.loading}>Загрузка...</div>

  return (
    <header className={styles.header}>
      <div className="flex">
        <button className="sm:hidden" onClick={toggleMenu}>
          <div className={styles.burherMenuIcon} aria-label="Burger Menu" />
        </button>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.open : ''}`}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <Link href="/teachers" className={styles.navLink}>
            Teachers
          </Link>
          <Link href="/chat" className={styles.navLink}>
            Chat
          </Link>

          {userRole === 'admin' && (
            <Link href="/addTeacher" className={styles.navLink}>
              addTeacher Admin
            </Link>
          )}
        </nav>
      </div>

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
            <Link href="/profileEdit">
              <div className={styles.userDetails}>
                <span>{userData?.name || user.displayName || 'User'}</span>
                {userData?.avatar ? (
                  <Image
                    src={userData.avatar}
                    alt={userData.name || 'User avatar'}
                    className={styles.userAvatar}
                    width={56}
                    height={56}
                  />
                ) : (
                  user.photoURL && (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || 'User avatar'}
                      className={styles.userAvatar}
                      width={56}
                      height={56}
                    />
                  )
                )}
              </div>
            </Link>

            <button onClick={handleSignOut} className={styles.signOutButton}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
