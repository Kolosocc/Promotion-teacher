'use client'

import React, { FC, useState, useEffect } from 'react'

import useUserData from '@/hooks/useUserData'
import { updateAvatarInFirestore, updateProfileInFirestore } from '@/utils/firebaseUtils'
import AvatarUpload from '@/components/register/AvatarUpload'
import { setUserData } from '@/models/userModel'

const ProfileEditPage: FC = () => {
  const { user, userData, loading } = useUserData()
  const [newName, setNewName] = useState<string>(userData?.name || '')
  const [newAvatar, setNewAvatar] = useState<File | null>(null)
  const [avatarURL, setAvatarURL] = useState<string>(userData?.avatar || '')

  useEffect(() => {
    if (userData) {
      setNewName(userData.name)
      setAvatarURL(userData.avatar || '')
    }
  }, [userData])

  const handleSave = async () => {
    if (user && newName) {
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

        alert('Profile updated successfully')
      } catch (error) {
        console.error('Error updating profile:', error)
        alert('Failed to update profile')
      }
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Edit Profile</h1>
      <div>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" value={newName} onChange={(e) => setNewName(e.target.value)} />
      </div>

      <div>
        <AvatarUpload avatar={newAvatar} setAvatar={setNewAvatar} />
      </div>

      {avatarURL && <img src={avatarURL} alt="Avatar Preview" width={100} />}

      <button onClick={handleSave}>Save</button>
    </div>
  )
}

export default ProfileEditPage
