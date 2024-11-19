'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export const TeacherDetails = () => {
  const { teacherId } = useParams()
  const [teacher, setTeacher] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (teacherId) {
      const teacherIdStr = Array.isArray(teacherId) ? teacherId[0] : teacherId
      const teacherRef = doc(db, 'teachers', teacherIdStr)
      const unsubscribe = onSnapshot(teacherRef, (teacherSnap) => {
        setTeacher(teacherSnap.exists() ? { id: teacherSnap.id, ...teacherSnap.data() } : null)
        setLoading(false)
      })

      return () => unsubscribe()
    }
  }, [teacherId])

  if (loading) return <div>Загрузка...</div>
  if (!teacher) return <div>Преподаватель не найден</div>

  return (
    <div>
      <h1>{teacher.name}</h1>
      <p>Кафедра: {teacher.department}</p>
      <p>Описание: {teacher.description}</p>
      <p>Сумма оценок: {teacher.sumRate}</p>
      <p>Количество оценок: {teacher.countRate}</p>
      <div className='flex flex-wrap gap-4'>
        {teacher.images.map((imageUrl: string, index: number) => (
          <img
            key={index}
            src={imageUrl}
            alt={`Teacher Image ${index + 1}`}
            className='w-32 h-32 object-cover rounded border'
          />
        ))}
      </div>
    </div>
  )
}
