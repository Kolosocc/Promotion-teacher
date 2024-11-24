import React, { FC, useState } from 'react'
import imageCompression from 'browser-image-compression'
import styles from './AvatarUpload.module.scss'
import Image from 'next/image'

interface AvatarUploadProps {
  avatar: File | null
  setAvatar: React.Dispatch<React.SetStateAction<File | null>>
}

const AvatarUpload: FC<AvatarUploadProps> = ({ avatar, setAvatar }) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
        }
        const compressedFile = await imageCompression(file, options)
        setAvatar(compressedFile)
      } catch (error) {
        console.error('Error compressing image:', error)
      }
    }
  }

  return (
    <div className={styles.avatarUpload}>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      {avatar && (
        <Image src={URL.createObjectURL(avatar)} alt="Avatar preview" width={100} height={100} />
      )}
    </div>
  )
}

export default AvatarUpload
