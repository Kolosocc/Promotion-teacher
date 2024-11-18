'use client'

import React, { useState } from 'react'
import { auth, db, storage } from '@/lib/firebase'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { useRouter } from 'next/navigation'
import {
  doc,
  setDoc,
  collection,
  addDoc,
  Timestamp,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { fetchUserDataFx } from '@/models/userModel'
import AvatarUpload from '@/components/AvatarUpload'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)

  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const admins = process.env.NEXT_PUBLIC_ADMINS?.split(',') || []

  const createChatsForUser = async (userId: string) => {
    const chatPromises = admins.map(async (adminId) => {
      const newChatDoc = await addDoc(collection(db, 'chats'), {
        createdAt: Timestamp.fromDate(new Date()),
        messages: [
          {
            createdAt: Timestamp.fromDate(new Date()),
            senderId: adminId,
            text: `Привет, как вы могли понять я админ. Меня можно найти по нику Admin. Вы всегда сможете связаться со мной через домашнюю страницу.`,
          },
        ],
      })

      return { chatId: newChatDoc.id, adminId }
    })

    const chatData = await Promise.all(chatPromises)

    return chatData
  }

  const addChatsToUserChats = async (
    userId: string,
    chatData: { chatId: string; adminId: string }[]
  ) => {
    const chatMessages = chatData.map(({ chatId, adminId }) => ({
      chatId,
      isSeen: false,
      lastMessage: `Привет, как вы могли понять я админ. Меня можно найти по нику Admin. Вы всегда сможете связаться со мной через домашнюю страницу.`,
      receiverId: adminId,
      updatedAt: Timestamp.fromDate(new Date()),
    }))

    await setDoc(doc(db, 'userchats', userId), {
      chats: chatMessages,
    })
  }

  const addChatsToAdmins = async (
    chatIds: { chatId: string; adminId: string }[],
    userId: string
  ) => {
    const adminPromises = chatIds.map(async ({ chatId, adminId }) => {
      const adminUserDoc = doc(db, 'userchats', adminId)

      await updateDoc(adminUserDoc, {
        chats: arrayUnion({
          chatId,
          isSeen: true,
          lastMessage: `Привет, как вы могли понять я админ. Меня можно найти по нику Admin. Вы всегда сможете связаться со мной через домашнюю страницу.`,
          receiverId: userId,
          updatedAt: Timestamp.fromDate(new Date()),
        }),
      })
    })

    await Promise.all(adminPromises)
  }

  const handleEmailPasswordRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await updateProfile(user, { displayName: name })

      let avatarURL = ''
      if (avatar) {
        const avatarRef = ref(storage, `avatars/${user.uid}/`)
        const uploadTask = uploadBytesResumable(avatarRef, avatar)

        await uploadTask
        avatarURL = await getDownloadURL(avatarRef)
      }

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name,
        avatar: avatarURL,
      })

      const chatData = await createChatsForUser(user.uid)
      await addChatsToUserChats(user.uid, chatData)
      await addChatsToAdmins(chatData, user.uid)
      fetchUserDataFx(user)
      router.push('/')
    } catch (error) {
      setError('Error registering: ' + error)
    }
  }

  const handleGoogleRegister = async () => {
    const provider = new GoogleAuthProvider()

    try {
      const userCredential = await signInWithPopup(auth, provider)
      const user = userCredential.user

      let avatarURL = user.photoURL || ''
      if (avatar) {
        const avatarRef = ref(storage, `avatars/${user.uid}/`)
        const uploadTask = uploadBytesResumable(avatarRef, avatar)
        await uploadTask
        avatarURL = await getDownloadURL(avatarRef)
      }

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: user.displayName,
        avatar: avatarURL,
      })

      const chatData = await createChatsForUser(user.uid)
      await addChatsToUserChats(user.uid, chatData)
      await addChatsToAdmins(chatData, user.uid)
      fetchUserDataFx(user)
      router.push('/')
    } catch (error) {
      setError('Error signing up with Google: ' + error)
    }
  }

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleEmailPasswordRegister}>
        <div>
          <label>Name</label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder='Enter your name'
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder='Enter your email'
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder='Enter your password'
          />
        </div>
        <div>
          <label>Avatar</label>
          <AvatarUpload avatar={avatar} setAvatar={setAvatar} />
        </div>
        {error && <p>{error}</p>}
        <button type='submit'>Register</button>
      </form>

      <div>
        <p>or</p>
        <button onClick={handleGoogleRegister}>Register with Google</button>
      </div>
    </div>
  )
}

export default Register
