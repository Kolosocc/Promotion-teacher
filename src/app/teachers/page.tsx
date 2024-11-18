'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const TeachersPage = () => {
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const teachersCollection = collection(db, 'teachers')
        const teacherSnapshot = await getDocs(teachersCollection)
        const teacherList = teacherSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
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
    <div>
      <h1>Преподаватели</h1>
      <ul>
        {teachers.map((teacher) => (
          <li key={teacher.id}>
            <div>
              {teacher.images && teacher.images.length > 0 ? (
                <img src={teacher.images[0]} alt={teacher.name} width={100} />
              ) : (
                <div>Нет изображения</div> 
              )}
            </div>
            <div>
              <h2>{teacher.name}</h2>
              <p>Кафедра: {teacher.department}</p>
              <p>Описание: {teacher.description}</p>
              <p>Средняя оценка: {teacher.sumRate}</p>
              <p>Количество отзывов: {teacher.countRate}</p>
              <Link className='bg-red-500 ' href={`/teachers/${teacher.id}`}>
                Подробнее
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TeachersPage
