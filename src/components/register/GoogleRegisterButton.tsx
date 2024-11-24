'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerUserWithGoogle, initializeUserChats } from '@/utils/firebaseUtils'
import { fetchUserDataFx } from '@/models/userModel'
import Image from 'next/image'
import styles from './GoogleRegisterButton.module.scss'

const GoogleRegisterButton = ({ admins }: { admins: string[] }) => {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleGoogleRegister = async () => {
    try {
      const user = await registerUserWithGoogle(null)
      await initializeUserChats(user.uid, admins)
      fetchUserDataFx(user)
      router.push('/')
    } catch (error: any) {
      setError('Error signing up with Google: ' + error.message)
    }
  }

  return (
    <div>
      <button onClick={handleGoogleRegister} className={styles.googleRegisterBtn}>
        <Image width={50} height={50} src="/google-icon.png" alt="Google Icon" />
        Register with Google
      </button>
      {error && <p>{error}</p>}
    </div>
  )
}

export default GoogleRegisterButton
