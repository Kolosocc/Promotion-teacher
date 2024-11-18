// src/components/header/Header.tsx
'use client'
import React, { FC } from 'react'
import Link from 'next/link'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import useUserData from '@/hooks/useUserData'

const Header: FC = () => {
  const { userData, loading, user } = useUserData()

  const handleSignOut = async () => {
    await signOut(auth)
  }

  if (loading) return <div>Loading...</div> // Показ загрузки

  return (
    <header className='flex gap-4 p-4 bg-gray-800 text-white'>
      <Link href='/'>Home</Link>
      <Link href='/teachers'>Teachers</Link>
      <Link href='/chat'>Chat</Link>

      {!user ? (
        <>
          <Link href='/login'>Login</Link>
          <Link href='/register'>Register</Link>
        </>
      ) : (
        <div className='flex items-center gap-4'>
          <span>{userData?.name || user.displayName}</span>
          {userData?.avatar ? (
            <img
              src={userData.avatar}
              alt={userData.name || 'User avatar'}
              className='w-8 h-8 rounded-full'
            />
          ) : (
            user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User avatar'}
                className='w-8 h-8 rounded-full'
              />
            )
          )}
          <button onClick={handleSignOut} className='bg-red-500 p-2 rounded'>
            Sign Out
          </button>
        </div>
      )}
    </header>
  )
}

export default Header
