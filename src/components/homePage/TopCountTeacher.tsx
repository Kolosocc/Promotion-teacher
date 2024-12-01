'use client'

import React, { FC, useEffect, useState } from 'react'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Teacher } from '@/types/Teachers'
import styles from './TopCountTeacher.module.scss'
import Link from 'next/link'
import Image from 'next/image'
import { renderRating } from '@/utils/renderRating'

const TopCountTeacher: FC = () => {
  const [topTeacher, setTopTeacher] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchTopTeacher = async () => {
      try {
        const teachersCollection = collection(db, 'teachers')
        const topTeacherQuery = query(teachersCollection, orderBy('countRate', 'desc'), limit(1))
        const querySnapshot = await getDocs(topTeacherQuery)

        if (!querySnapshot.empty) {
          const teacherData = querySnapshot.docs[0].data() as Teacher
          setTopTeacher({ ...teacherData, id: querySnapshot.docs[0].id })
        } else {
          setTopTeacher(null) // Если нет данных
        }
      } catch (error) {
        console.error('Ошибка при получении преподавателя:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopTeacher()
  }, [])

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>
  }

  if (!topTeacher) {
    return <div className={styles.notFound}>Нет данных о преподавателе</div>
  }

  return (
    <div className={styles.teacherCountContainer}>
      <h2>Самый часто оценееваемый преподавлель</h2>
      <div className={styles.teacherDetails}>
        <div className={styles.imageContainer}>
          {topTeacher.images && topTeacher.images.length > 0 ? (
            <Image
              width={600}
              height={600}
              src={topTeacher.images[0]}
              alt={topTeacher.name}
              className={styles.teacherImage}
            />
          ) : (
            <div className={styles.noImage}>Нет изображения</div>
          )}
        </div>
        <div className={styles.teacherInfo}>
          <h1 className={styles.teacherName}>{topTeacher.name}</h1>
          <p className={styles.teacherMeta}>Кафедра: {topTeacher.department || 'Не указано'}</p>
          <p className={styles.teacherDescription}>
            Описание: {topTeacher.description || 'Нет описания'}
          </p>
          <div className={styles.bottomCurt}>
            <div className={styles.bottomCurtLeft}>
              <p className="flex items-center">
                Рейтинг:&nbsp;&nbsp;
                {renderRating({
                  sumRate: topTeacher.sumRate,
                  countRate: topTeacher.countRate,
                  rem: 2,
                })}
              </p>
              <p>Оценок: {topTeacher.countRate}</p>
            </div>
            <div className={styles.bottomCurtRicht}>
              <Link href={`/teachers/${topTeacher.id}`} className={styles.linkButton}>
                Подробнее
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopCountTeacher
