'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { doc, collection, getDoc, setDoc, updateDoc, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useUser } from '@/hooks/useUser'
import styles from './RatingsSection.module.scss'

export const RatingsSection = () => {
  const { teacherId } = useParams()
  const { user, loading } = useUser()
  const [rating, setRating] = useState(0)
  const [userRating, setUserRating] = useState<number | null>(null)

  useEffect(() => {
    if (loading || !user || !teacherId) return

    const teacherIdStr = Array.isArray(teacherId) ? teacherId[0] : teacherId

    getDoc(doc(db, 'teachers', teacherIdStr, 'rates', user.uid)).then((snap) => {
      setUserRating(snap.exists() ? snap.data()?.num || null : null)
    })
  }, [user, teacherId, loading])

  const handleRating = async (newRating: number) => {
    setRating(newRating)

    if (loading || !user || !teacherId || newRating === 0) return

    const teacherIdStr = Array.isArray(teacherId) ? teacherId[0] : teacherId
    const teacherRef = doc(db, 'teachers', teacherIdStr)
    const ratingsRef = collection(db, 'teachers', teacherIdStr, 'rates')

    try {
      await setDoc(doc(ratingsRef, user.uid), { num: newRating })

      const ratingsSnap = await getDocs(ratingsRef)
      const ratings = ratingsSnap.docs.map((doc) => doc.data()?.num || 0)
      const sumRate = ratings.reduce((acc, r) => acc + r, 0)
      const countRate = ratings.length

      await updateDoc(teacherRef, { sumRate, countRate })
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
                className={`${styles.ratingButton} ${rating === i + 1 ? styles.selected : ''}`}
                style={{
                  borderColor: `rgb(${220 - i * 20}, ${i * 20}, 0)`,
                  color: `rgb(${220 - i * 20}, ${i * 20}, 0)`,
                  backgroundColor:
                    userRating === i + 1 ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
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
