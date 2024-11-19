'use client'

import React from 'react'
import RegisterForm from '@/components/register/RegisterForm'
import GoogleRegisterButton from '@/components/register/GoogleRegisterButton'

const RegisterPage = () => {
  const admins = process.env.NEXT_PUBLIC_ADMINS?.split(',') || []

  return (
    <div>
      <h1>Register</h1>
      <RegisterForm admins={admins} />
      <div>
        <p>or</p>
        <GoogleRegisterButton admins={admins} />
      </div>
    </div>
  )
}

export default RegisterPage
