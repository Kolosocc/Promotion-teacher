'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { db, storage } from '@/lib/firebase'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { collection, doc, setDoc } from 'firebase/firestore'
import useUserData from '@/hooks/useUserData'
import styles from './AddTeacher.module.scss'

const AddTeacher = () => {
  const { userRole, loading } = useUserData()
  const router = useRouter()

  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  if (loading) return <div className="loading">Loading...</div>

  if (userRole !== 'admin') {
    router.push('/')
    return null
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setImages((prev) => [...prev, ...newFiles])
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleImageUpload = async (files: File[]) => {
    const urls: string[] = []
    for (const file of files) {
      const storageRef = ref(storage, `teachers/${file.name}`)
      const uploadTask = uploadBytesResumable(storageRef, file)

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          null,
          (error) => {
            console.error('Upload error:', error)
            reject(error)
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            urls.push(downloadURL)
            resolve()
          },
        )
      })
    }
    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !department || !description || images.length === 0) {
      alert('All fields are required')
      return
    }

    setUploading(true)

    try {
      const imageUrls = await handleImageUpload(images)

      const teacherRef = doc(collection(db, 'teachers'))
      await setDoc(teacherRef, {
        name,
        department,
        description,
        images: imageUrls,
        sumRate: 0,
        countRate: 0,
      })

      await setDoc(doc(teacherRef, 'comments', 'placeholder'), {})
      await setDoc(doc(teacherRef, 'rates', 'placeholder'), {})

      alert('Teacher added successfully!')
      router.push('/teachers')
    } catch (error) {
      console.error('Error adding teacher:', error)
      alert('Failed to add teacher')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Add Teacher</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="text"
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className={styles.input}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
          required
        ></textarea>
        <input
          type="file"
          multiple
          onChange={handleImageChange}
          className={styles.hiddenInput}
          id="file-upload"
        />
        <label htmlFor="file-upload" className={styles.label}>
          Выберите файл
        </label>
        <div className={styles.imagePreviewContainer}>
          {images.map((image, index) => (
            <div key={index} className={styles.imagePreview}>
              <img src={URL.createObjectURL(image)} alt="Preview" />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className={styles.removeButton}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="submit"
          disabled={uploading}
          className={uploading ? styles.uploadingButton : styles.submitButton}
        >
          {uploading ? 'Uploading...' : 'Add Teacher'}
        </button>
      </form>
    </div>
  )
}

export default AddTeacher
