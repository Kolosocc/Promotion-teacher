'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { db, storage } from '@/lib/firebase'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { collection, doc, setDoc } from 'firebase/firestore'
import useUserData from '@/hooks/useUserData'

const AddTeacher = () => {
  const { userRole, loading } = useUserData()
  const router = useRouter()

  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  if (loading) return <div>Loading...</div>

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
          }
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
      // Загрузка изображений
      const imageUrls = await handleImageUpload(images)

      // Создание документа в коллекции teachers
      const teacherRef = doc(collection(db, 'teachers'))
      await setDoc(teacherRef, {
        name,
        department,
        description,
        images: imageUrls,
        sumRate: 0,
        countRate: 0,
      })

      // Добавление вложенных коллекций
      await setDoc(doc(teacherRef, 'comments', 'placeholder'), {}) // Пустой документ
      await setDoc(doc(teacherRef, 'rates', 'placeholder'), {}) // Пустой документ

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
    <div className='p-4'>
      <h1 className='text-xl font-bold'>Add Teacher</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          type='text'
          placeholder='Name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          className='p-2 border'
          required
        />
        <input
          type='text'
          placeholder='Department'
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className='p-2 border'
          required
        />
        <textarea
          placeholder='Description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className='p-2 border'
          required
        ></textarea>
        <input type='file' multiple onChange={handleImageChange} className='p-2' />
        <div className='flex flex-wrap gap-2'>
          {images.map((image, index) => (
            <div key={index} className='relative'>
              <img
                src={URL.createObjectURL(image)}
                alt='Preview'
                className='w-20 h-20 object-cover rounded'
              />
              <button
                type='button'
                onClick={() => handleRemoveImage(index)}
                className='absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs'
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button type='submit' disabled={uploading} className='p-2 bg-blue-500 text-white rounded'>
          {uploading ? 'Uploading...' : 'Add Teacher'}
        </button>
      </form>
    </div>
  )
}

export default AddTeacher
