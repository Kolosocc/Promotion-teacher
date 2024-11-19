'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import AvatarUpload from '@/components/register/AvatarUpload'
import { registerUserWithEmailPassword, initializeUserChats } from '@/utils/firebaseUtils'
import { fetchUserDataFx } from '@/models/userModel'

const RegisterForm = ({ admins }: { admins: string[] }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const user = await registerUserWithEmailPassword(email, password, name, avatar)
      await initializeUserChats(user.uid, admins)
      fetchUserDataFx(user)
      router.push('/')
    } catch (error: any) {
      setError('Error registering: ' + error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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
  )
}

export default RegisterForm
