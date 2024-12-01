'use client'

import React from 'react'
import Link from 'next/link'
import styles from './HomePage.module.scss'
import TopCountTeacher from './TopCountTeacher'

const HomePage = () => {
  return (
    <div className={styles.homePage}>
      <section className={styles.heroSection}>
        <img src="/home/Hero.jpg" alt="Hero" className={styles.heroImage} />
        <div className={styles.heroContent}>
          <h1>Добро пожаловать на наш сайт!</h1>
          <p>Здесь вы найдете лучших учителей и полезные инструменты для учебы.</p>
        </div>
      </section>

      <section className={styles.cardsSection}>
        <Link href="/chat" className={styles.card}>
          <img src="/home/ChatCart.jpg" alt="Chat" className={styles.cardImage} />
          <h2>Чат с Админом</h2>
          <p>
            Мы будем рады ответить на ваши вопросы, принять предложения по улучшению сайта и просто
            пообщаться
          </p>
        </Link>
        <Link href="/teachers" className={styles.card}>
          <img src="/home/TeacherCart.jpg" alt="Teacher" className={styles.cardImage} />
          <h2>Преподаватели</h2>
          <p>Просматривайте профили преподавателей и общайтесь с другими пользвателями</p>
        </Link>
        <Link href="/profileEdit" className={styles.card}>
          <img src="/home/ProfileCart.jpg" alt="Profile" className={styles.cardImage} />
          <h2>Ваш профиль</h2>
          <p>Настраивайте свой профиль, наслождайтесь собственным стилем)</p>
        </Link>
      </section>
      <TopCountTeacher />
    </div>
  )
}

export default HomePage
