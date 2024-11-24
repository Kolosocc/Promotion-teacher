'use client'

import React, { useState } from 'react'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

const GoogleLoginButton = () => {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      router.push('/')
    } catch (error: any) {
      setError(error.message || 'Error signing in with Google')
    }
  }

  return (
    <div>
      <button onClick={handleGoogleLogin}>Sign in with Google</button>
      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default GoogleLoginButton
