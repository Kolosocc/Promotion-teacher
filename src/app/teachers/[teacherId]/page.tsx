'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  getDoc,
  doc,
  addDoc,
  collection,
  updateDoc,
  onSnapshot,
  query,
  getDocs,
  setDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useUser } from '@/hooks/useUser'

const TeacherDetailsPage = () => {
  const { teacherId } = useParams()
  const [teacher, setTeacher] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loadingTeacher, setLoadingTeacher] = useState(true)
  const [loadingComments, setLoadingComments] = useState(true)
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(0)
  const [userRating, setUserRating] = useState<number | null>(null)

  const user = useUser()
  const loading = loadingTeacher || loadingComments

  useEffect(() => {
    if (teacherId) {
      const teacherIdStr = Array.isArray(teacherId) ? teacherId[0] : teacherId

      const teacherRef = doc(db, 'teachers', teacherIdStr)
      const unsubscribeTeacher = onSnapshot(teacherRef, (teacherSnap) => {
        if (teacherSnap.exists()) {
          setTeacher({ id: teacherSnap.id, ...teacherSnap.data() })
        } else {
          console.log('Преподаватель не найден')
        }
        setLoadingTeacher(false)
      })

      const commentsRef = collection(db, 'teachers', teacherIdStr, 'comments')
      const q = query(commentsRef)
      const unsubscribeComments = onSnapshot(q, (commentsSnap) => {
        const commentsData = commentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setComments(commentsData)
        setLoadingComments(false)
      })

      return () => {
        unsubscribeTeacher()
        unsubscribeComments()
      }
    }
  }, [teacherId])

  useEffect(() => {
    if (user && teacherId) {
      const ratingsRef = collection(db, 'teachers', teacherId, 'rates')
      const ratingDocRef = doc(ratingsRef, user.uid)

      const getUserRating = async () => {
        const ratingSnap = await getDoc(ratingDocRef)
        if (ratingSnap.exists()) {
          setUserRating(ratingSnap.data().num)
        } else {
          setUserRating(null)
        }
      }

      getUserRating()
    }
  }, [user, teacherId])

  const handleSubmitComment = async () => {
    if (!comment) {
      alert('Пожалуйста, оставьте комментарий.')
      return
    }

    if (user && teacher) {
      const commentsRef = collection(db, 'teachers', teacher.id, 'comments')

      try {
        await addDoc(commentsRef, {
          text: comment,
          rate: [],
          timestamp: new Date(),
          userId: user.uid,
        })

        alert('Комментарий добавлен!')
        setComment('')
      } catch (error) {
        console.error('Ошибка при добавлении комментария:', error)
      }
    } else {
      alert('Для добавления комментариев необходимо авторизоваться.')
    }
  }

  const handleLike = async (commentId: string) => {
    if (!user || !teacher) {
      alert('Для того, чтобы поставить лайк, нужно авторизоваться.')
      return
    }

    const commentRef = doc(db, 'teachers', teacher.id, 'comments', commentId)

    try {
      const commentSnap = await getDoc(commentRef)
      if (!commentSnap.exists()) {
        console.log('Комментарий не найден')
        return
      }

      const commentData = commentSnap.data()
      const currentLikes = commentData?.rate || []

      const userHasLiked = currentLikes.includes(user.uid)

      const updatedLikes = userHasLiked
        ? currentLikes.filter((userId: string) => userId !== user.uid)
        : [...currentLikes, user.uid]

      await updateDoc(commentRef, {
        rate: updatedLikes,
      })

      alert(userHasLiked ? 'Лайк убран!' : 'Лайк добавлен!')
    } catch (error) {
      console.error('Ошибка при обновлении лайка:', error)
    }
  }

  const handleSubmitRating = async () => {
    if (rating === 0) {
      alert('Пожалуйста, выберите оценку.')
      return
    }

    if (user && teacher) {
      const teacherRef = doc(db, 'teachers', teacher.id)
      const ratingsRef = collection(db, 'teachers', teacher.id, 'rates')

      try {
        const teacherSnap = await getDoc(teacherRef)

        if (!teacherSnap.exists()) {
          console.log('Преподаватель не найден')
          return
        }

        const ratingDocRef = doc(ratingsRef, user.uid)

        await setDoc(ratingDocRef, {
          num: Number(rating),
        })

        const ratingsSnap = await getDocs(ratingsRef)
        const ratingsData = ratingsSnap.docs.map((doc) => doc.data())

        const validRatings = ratingsData.filter((rating: any) => typeof rating.num === 'number')

        const totalRatings = validRatings.reduce((acc: number, rating: any) => acc + rating.num, 0)

        const countRate = validRatings.length

        await updateDoc(teacherRef, {
          countRate: countRate,
          sumRate: totalRatings,
        })

        alert('Оценка добавлена или обновлена!')
        setRating(0)
        setUserRating(Number(rating))
      } catch (error) {
        console.error('Ошибка при добавлении или обновлении оценки:', error)
      }
    } else {
      alert('Для добавления оценки необходимо авторизоваться.')
    }
  }

  if (loading) {
    return <div>Загрузка...</div>
  }

  if (!teacher) {
    return <div>Преподаватель не найден</div>
  }

  return (
    <div>
      <h1>{teacher.name}</h1>
      <p>Кафедра: {teacher.department}</p>
      <p>Описание: {teacher.description}</p>
      <p>Сумма оценок: {teacher.sumRate}</p>
      <p>Количество оценок: {teacher.countRate}</p>

      <h2>Отзывы:</h2>
      <ul>
        {comments.length > 0 ? (
          comments.map((comment) => {
            const hasLiked = Array.isArray(comment.rate) && comment.rate.includes(user?.uid)
            return (
              <li key={comment.id}>
                <p>{comment.text}</p>
                <p>Лайки: {Array.isArray(comment.rate) ? comment.rate.length : 0}</p>
                <button
                  style={{
                    backgroundColor: hasLiked ? 'green' : 'gray',
                    color: 'white',
                  }}
                  onClick={() => handleLike(comment.id)}
                >
                  {hasLiked ? 'Убрать лайк' : 'Поставить лайк'}
                </button>
              </li>
            )
          })
        ) : (
          <p>Нет отзывов</p>
        )}
      </ul>

      <h2>Добавить комментарий:</h2>
      {!user ? (
        <p>Для добавления комментария, давайте сперва авторизуемся.</p>
      ) : (
        <div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder='Ваш комментарий'
          ></textarea>
          <button onClick={handleSubmitComment}>Отправить комментарий</button>
        </div>
      )}

      <h2>Добавить оценку:</h2>
      {!user ? (
        <p>Для добавления оценки, давайте сперва авторизуемся.</p>
      ) : (
        <div>
          <label>Оценка: </label>
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
      )}
    </div>
  )
}

export default TeacherDetailsPage
