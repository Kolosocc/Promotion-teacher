'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { doc, collection, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useUser } from '@/hooks/useUser'
import styles from './RatingsSection.module.scss'

export const RatingsSection = () => {
  const { teacherId } = useParams()
  const { user, loading } = useUser()
  const [userRating, setUserRating] = useState<number | null>(null)

  useEffect(() => {
    if (loading || !user || !teacherId) return

    const teacherIdStr = Array.isArray(teacherId) ? teacherId[0] : teacherId

    getDoc(doc(db, 'teachers', teacherIdStr, 'rates', user.uid)).then((snap) => {
      setUserRating(snap.exists() ? snap.data()?.num || null : null)
    })
  }, [user, teacherId, loading])

  const handleRating = async (newRating: number) => {
    if (loading || !user || !teacherId || newRating === 0) return

    const teacherIdStr = Array.isArray(teacherId) ? teacherId[0] : teacherId
    const teacherRef = doc(db, 'teachers', teacherIdStr)
    const ratingsRef = collection(db, 'teachers', teacherIdStr, 'rates')

    try {
      const userRatingRef = doc(ratingsRef, user.uid)
      const userRatingSnap = await getDoc(userRatingRef)

      let delta = newRating
      if (userRatingSnap.exists()) {
        const oldRating = userRatingSnap.data()?.num || 0
        delta = newRating - oldRating
      } else {
        await updateDoc(teacherRef, { countRate: increment(1) })
      }

      await updateDoc(teacherRef, { sumRate: increment(delta) })

      await setDoc(userRatingRef, { num: newRating })

      setUserRating(newRating)
    } catch (error) {
      console.error('Ошибка при обновлении рейтинга:', error)
    }
  }

  if (loading) return <p className="loading">Загрузка...</p>

  return (
    <div className={styles['ratings-container']}>
      <h2 className={styles.heading}>Добавить оценку:</h2>

      {user ? (
        <div className={styles.form}>
          {[...Array(10).keys()].map((i) => (
            <button
              key={i + 1}
              className={`${styles.ratingButton} ${userRating === i + 1 ? styles.selected : ''}`}
              style={{
                borderColor: `rgb(${220 - i * 20}, ${i * 20}, 0)`,
                color: `rgb(${220 - i * 20}, ${i * 20}, 0)`,
                backgroundColor: userRating === i + 1 ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              }}
              onClick={() => handleRating(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      ) : (
        <p className={styles.warning}>Авторизуйтесь, чтобы оценить преподавателя.</p>
      )}

      {userRating === null && (
        <p className={styles.warning}>А насколько вам нравиться преподаватель ?</p>
      )}
    </div>
  )
}
