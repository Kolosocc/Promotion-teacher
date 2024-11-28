'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import AvatarUpload from '@/components/register/AvatarUpload'
import { registerUserWithEmailPassword, initializeUserChats } from '@/utils/firebaseUtils'
import { fetchUserDataFx } from '@/models/userModel'
import Link from 'next/link'

const RegisterForm = ({}: {}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const user = await registerUserWithEmailPassword(email, password, name, avatar)
      await initializeUserChats(user.uid)
      fetchUserDataFx(user)
      router.push('/')
    } catch (error: any) {
      setError('Error registering: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter your name"
        />
      </div>
      <div>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
        />
      </div>
      <div>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
        />
      </div>
      <div className="avatarUpload">
        <AvatarUpload avatar={avatar} setAvatar={setAvatar} />
      </div>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>
      <Link className='' href="/login">Login</Link>
    </form>
  )
}

export default RegisterForm
