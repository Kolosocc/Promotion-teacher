'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { doc, collection, getDoc, setDoc, updateDoc, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useUser } from '@/hooks/useUser'

export const RatingsSection = () => {
  const { teacherId } = useParams()
  const user = useUser()
  const [rating, setRating] = useState(0)
  const [userRating, setUserRating] = useState<number | null>(null)

  useEffect(() => {
    if (user && teacherId) {
      const teacherIdStr = Array.isArray(teacherId) ? teacherId[0] : teacherId
      if (!teacherIdStr) return 

      const ratingDoc = doc(db, 'teachers', teacherIdStr, 'rates', user.uid)
      getDoc(ratingDoc).then((snap) => {
        setUserRating(snap.exists() ? snap.data()?.num || null : null)
      })
    }
  }, [user, teacherId])

  const handleSubmitRating = async () => {
    if (!user || !teacherId || rating === 0) {
      alert('Пожалуйста, выберите оценку.')
      return
    }

    const teacherIdStr = Array.isArray(teacherId) ? teacherId[0] : teacherId
    if (!teacherIdStr) return // Проверка на undefined или пустую строку

    const teacherRef = doc(db, 'teachers', teacherIdStr)
    const ratingsRef = collection(db, 'teachers', teacherIdStr, 'rates')

    try {
      await setDoc(doc(ratingsRef, user.uid), { num: rating })

      const ratingsSnap = await getDocs(ratingsRef)
      const ratings = ratingsSnap.docs.map((doc) => doc.data()?.num || 0)
      const sumRate = ratings.reduce((acc, r) => acc + r, 0)
      const countRate = ratings.length

      await updateDoc(teacherRef, { sumRate, countRate })
      setUserRating(rating)
    } catch (error) {
      console.error('Ошибка при обновлении рейтинга:', error)
    }
  }

  return (
    <div>
      <h2>Добавить оценку:</h2>
      {user ? (
        <div>
          <select
            value={rating || userRating || 0}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            <option value={0}>Выберите оценку</option>
            {[...Array(10).keys()].map((i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          <button onClick={handleSubmitRating}>Отправить оценку</button>
        </div>
      ) : (
        <p>Авторизуйтесь, чтобы оценить преподавателя.</p>
      )}
    </div>
  )
}
