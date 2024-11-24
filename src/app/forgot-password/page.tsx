'use client'

import React, { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import styles from './ForgotPasswordPage.module.scss'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault()

    setError(null)
    setSuccess(null)

    try {
      await sendPasswordResetEmail(auth, email)
      setSuccess('Password reset email has been sent. Please check your inbox.')
    } catch (error: any) {
      setError(error.message || 'Failed to send password reset email.')
    }
  }

  return (
    <div className={styles.forgotPasswordContainer}>
      <h1>Forgot Password</h1>
      <form onSubmit={handleSendResetEmail}>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <button type="submit">Send Reset Email</button>
      </form>
    </div>
  )
}

export default ForgotPasswordPage
