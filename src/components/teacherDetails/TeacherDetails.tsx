'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Teacher } from '@/types/Teachers'
import styles from './TeacherDetails.module.scss'
import Image from 'next/image'
import { renderRating } from '@/utils/renderRating'

export const TeacherDetails = () => {
  const { teacherId } = useParams()
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string>('')

  useEffect(() => {
    if (!teacherId) return

    const teacherIdStr = Array.isArray(teacherId) ? teacherId[0] : teacherId
    const teacherRef = doc(db, 'teachers', teacherIdStr)
    const unsubscribe = onSnapshot(teacherRef, (teacherSnap) => {
      const teacherData = teacherSnap.exists()
        ? ({ id: teacherSnap.id, ...teacherSnap.data() } as Teacher)
        : null

      if (teacherData && teacherData.images && teacherData.images.length > 0) {
        setTeacher(teacherData)
        setSelectedImage(teacherData.images[0])
      } else {
        setTeacher(teacherData)
        setSelectedImage('')
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [teacherId])

  const handleImageClick = (image: string) => {
    setSelectedImage(image)
  }

  if (loading) return <div className="loading">Загрузка...</div>
  if (!teacher) return <div className="notFound">Преподаватель не найден</div>

  return (
    <div className={styles.teacherDetails}>
      <div className={styles.imageContainer}>
        {selectedImage && (
          <Image
            width={600}
            height={600}
            src={selectedImage}
            alt={`Teacher Image`}
            className={styles.teacherImage}
          />
        )}
        {teacher.images && teacher.images.length > 1 && (
          <div className={styles.thumbnailContainer}>
            {teacher.images.map((image: string, index: number) => (
              <div key={index} className={styles.thumbnail} onClick={() => handleImageClick(image)}>
                <Image
                  width={100}
                  height={100}
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className={styles.thumbnailImage}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={styles.teacherInfo}>
        <h1>{teacher.name}</h1>
        <p>Кафедра: {teacher.department}</p>
        <p>Описание: {teacher.description}</p>
        <p className="flex">
          Рейтинг:&nbsp;&nbsp;{renderRating({ sumRate: teacher.sumRate, countRate: teacher.countRate, rem: 2 })}
        </p>
      </div>
    </div>
  )
}
