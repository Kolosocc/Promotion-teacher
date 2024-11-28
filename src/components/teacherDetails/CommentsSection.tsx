'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useUser } from '@/hooks/useUser'
import styles from './CommentsSection.module.scss'

export const CommentsSection = () => {
  const { teacherId } = useParams()
  const { user, loading } = useUser()
  const [comments, setComments] = useState<any[]>([])
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (loading) return

    const teacherIdStr = Array.isArray(teacherId) ? teacherId[0] : teacherId
    if (!teacherIdStr) return

    const commentsRef = collection(db, 'teachers', teacherIdStr, 'comments')
    const commentsQuery = query(commentsRef, orderBy('timestamp', 'asc'))

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })

    return () => unsubscribe()
  }, [teacherId, loading])

  const handleSubmitComment = async () => {
    if (loading) return
    if (!comment) return alert('Пожалуйста, оставьте комментарий.')
    if (!user) return alert('Необходимо авторизоваться.')

    const teacherIdStr = Array.isArray(teacherId) ? teacherId[0] : teacherId
    if (!teacherIdStr) return

    const commentsRef = collection(db, 'teachers', teacherIdStr, 'comments')

    try {
      await addDoc(commentsRef, {
        text: comment,
        rate: [],
        timestamp: new Date(),
        userId: user.uid,
        username: user.displayName || 'Неизвестный пользователь',
      })
      setComment('')
    } catch (error) {
      console.error('Ошибка добавления комментария:', error)
    }
  }

  const handleLike = async (commentId: string) => {
    if (loading) return

    const teacherIdStr = Array.isArray(teacherId) ? teacherId[0] : teacherId
    if (!teacherIdStr) return

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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault() // Отменяем стандартное поведение Enter
      handleSubmitComment() // Отправляем комментарий
    }
  }

  if (loading) return <p>Загрузка...</p>

  return (
    <div className={styles.chatContainer}>
      <h1>Отзывы</h1>
      <div className={styles.messagesSection}>
        <h2>Комментарии</h2>
        <ul>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <li
                key={comment.id}
                className={styles.messageItem}
                data-message={comment.userId === user?.uid ? 'sent' : 'received'}
              >
                <p>
                  <strong>{comment.username}</strong> (Добавлен:{' '}
                  {new Date(comment.timestamp.seconds * 1000).toLocaleString()})
                </p>
                <p
                  dangerouslySetInnerHTML={{
                    __html: comment.text.replace(/\n/g, '<br />'),
                  }}
                ></p>
                <p>Лайки: {comment.rate?.length || 0}</p>
                <button
                  className={comment.rate?.includes(user?.uid) ? styles.liked : styles.notLiked}
                  onClick={() => handleLike(comment.id)}
                >
                  {comment.rate?.includes(user?.uid) ? 'Убрать лайк' : 'Поставить лайк'}
                </button>
              </li>
            ))
          ) : (
            <p>Нет отзывов</p>
          )}
        </ul>
      </div>

      {user && (
        <div className={styles.formSection}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Write a message... (Shift + Enter for new line)"
            className={styles.textarea}
          />
          <button onClick={handleSubmitComment} className={styles.submitButton}>
            Отправить комментарий
          </button>
        </div>
      )}
    </div>
  )
}
