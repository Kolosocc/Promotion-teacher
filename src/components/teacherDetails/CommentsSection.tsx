'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { collection, addDoc, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useUser } from '@/hooks/useUser'

export const CommentsSection = () => {
  const { teacherId } = useParams()
  const [comments, setComments] = useState<any[]>([])
  const [comment, setComment] = useState('')
  const user = useUser()

  useEffect(() => {
    const teacherIdStr = Array.isArray(teacherId) ? teacherId[0] : teacherId
    if (!teacherIdStr) return 

    const commentsRef = collection(db, 'teachers', teacherIdStr, 'comments')
    const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
      setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })

    return () => unsubscribe()
  }, [teacherId])

  const handleSubmitComment = async () => {
    const teacherIdStr = Array.isArray(teacherId) ? teacherId[0] : teacherId
    if (!teacherIdStr) return 
    if (!comment) return alert('Пожалуйста, оставьте комментарий.')
    if (!user) return alert('Необходимо авторизоваться.')

    const commentsRef = collection(db, 'teachers', teacherIdStr, 'comments')

    try {
      await addDoc(commentsRef, {
        text: comment,
        rate: [],
        timestamp: new Date(),
        userId: user.uid,
      })
      setComment('')
    } catch (error) {
      console.error('Ошибка добавления комментария:', error)
    }
  }

  const handleLike = async (commentId: string) => {
    const teacherIdStr = Array.isArray(teacherId) ? teacherId[0] : teacherId
    if (!teacherIdStr) return // Проверка на отсутствие teacherId

    if (!user) return alert('Авторизуйтесь, чтобы поставить лайк.')

    const commentRef = doc(db, 'teachers', teacherIdStr, 'comments', commentId)
    const commentSnap = await getDoc(commentRef)

    if (commentSnap.exists()) {
      const currentLikes = commentSnap.data().rate || []
      const updatedLikes = currentLikes.includes(user.uid)
        ? currentLikes.filter((id: string) => id !== user.uid)
        : [...currentLikes, user.uid]

      await updateDoc(commentRef, { rate: updatedLikes })
    }
  }

  return (
    <div>
      <h2>Отзывы:</h2>
      <ul>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <li key={comment.id}>
              <p>{comment.text}</p>
              <p>Лайки: {comment.rate?.length || 0}</p>
              <button onClick={() => handleLike(comment.id)}>
                {comment.rate?.includes(user?.uid) ? 'Убрать лайк' : 'Поставить лайк'}
              </button>
            </li>
          ))
        ) : (
          <p>Нет отзывов</p>
        )}
      </ul>

      {user && (
        <div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder='Ваш комментарий'
          />
          <button onClick={handleSubmitComment}>Отправить комментарий</button>
        </div>
      )}
    </div>
  )
}
