'use client'

import React, { FC, useEffect, useState } from 'react'
import Link from 'next/link'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Teacher } from '@/types/Teachers'
import styles from './TeachersPage.module.scss'
import { renderRating } from '@/utils/renderRating'

const TeachersPage: FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const teachersCollection = collection(db, 'teachers')
        const teacherSnapshot = await getDocs(teachersCollection)
        const teacherList: Teacher[] = teacherSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Teacher[]
        setTeachers(teacherList)
      } catch (error) {
        console.error('Ошибка при получении данных преподавателей:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeachers()
  }, [])

  if (loading) {
    return <div>Загрузка...</div>
  }

  if (teachers.length === 0) {
    return <div>Нет данных о преподавателях</div>
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Преподаватели</h1>
      {loading ? (
        <div className={styles.loading}>Загрузка...</div>
      ) : teachers.length === 0 ? (
        <div className={styles.noData}>Нет данных о преподавателях</div>
      ) : (
        <ul className={styles.teachersList}>
          {teachers.map((teacher) => (
            <li key={teacher.id} className={styles.teacherItem}>
              <div className={styles.imageContainer}>
                {teacher.images && teacher.images.length > 0 ? (
                  <img src={teacher.images[0]} alt={teacher.name} className={styles.teacherImage} />
                ) : (
                  <div className={styles.noImage}>Нет изображения</div>
                )}
              </div>
              <div className={styles.teacherDetails}>
                <h2 className={styles.teacherName}>{teacher.name}</h2>
                <p className={styles.teacherMeta}>Кафедра: {teacher.department || 'Не указано'}</p>
                <p className={styles.teacherDescription}>
                  Описание: {teacher.description || 'Нет описания'}
                </p>
                <div className={styles.bottomCurt}>
                  <Link href={`/teachers/${teacher.id}`} className={styles.linkButton}>
                    Подробнее
                  </Link>
                  {renderRating({
                    sumRate: teacher.sumRate,
                    countRate: teacher.countRate,
                    rem: 1.2,
                  })}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default TeachersPage
