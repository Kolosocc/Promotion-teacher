'use client'

import React, { FC, useState, useEffect } from 'react'
import useUserData from '@/hooks/useUserData'
import { updateAvatarInFirestore, updateProfileInFirestore } from '@/utils/firebaseUtils'
import AvatarUpload from '@/components/register/AvatarUpload'
import { setUserData } from '@/models/userModel'
import styles from './ProfileEditPage.module.scss'
import Image from 'next/image'

const ProfileEditPage: FC = () => {
  const { user, userData, loading } = useUserData()
  const [newName, setNewName] = useState<string>(userData?.name || '')
  const [newAvatar, setNewAvatar] = useState<File | null>(null)
  const [avatarURL, setAvatarURL] = useState<string>(userData?.avatar || '')
  const [isSaving, setIsSaving] = useState<boolean>(false)

  useEffect(() => {
    if (userData) {
      setNewName(userData.name)
      setAvatarURL(userData.avatar || '')
    }
  }, [userData])

  const handleSave = async () => {
    if (user && newName) {
      setIsSaving(true)
      try {
        let updatedAvatarURL = avatarURL

        if (newAvatar) {
          updatedAvatarURL = await updateAvatarInFirestore(user.uid, newAvatar)
          setAvatarURL(updatedAvatarURL)
        }

        await updateProfileInFirestore(user.uid, newName, updatedAvatarURL)
        setUserData({
          ...userData,
          name: newName,
          avatar: updatedAvatarURL,
          email: userData?.email || '',
        })
      } catch (error) {
        console.error('Error updating profile:', error)
        alert('Failed to update profile')
      } finally {
        setIsSaving(false)
      }
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className={styles.profileEditContainer}>
      <h1>Edit Profile</h1>
      <form>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        <div className={styles.avatarUpload}>
          <AvatarUpload avatar={newAvatar} setAvatar={setNewAvatar} />
        </div>

        {avatarURL && (
          <div>
            <label htmlFor="name">Old avatar:</label>
            <div className={styles.avatarPreview}>
              <Image height={100} width={100} src={avatarURL} alt="Avatar Preview" />
            </div>
          </div>
        )}

        <button
          className={`${isSaving ? styles.loading : ''} ${styles.loadingButton}`}
          type="button"
          onClick={handleSave}
          disabled={isSaving}
        >
          <p>
            {isSaving ? (
              <>
                Loading<span className={styles.dots}></span>
              </>
            ) : (
              'Save'
            )}
          </p>
        </button>
      </form>
    </div>
  )
}

export default ProfileEditPage
