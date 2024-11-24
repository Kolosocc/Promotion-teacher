'use client'

import styles from './RegisterPage.module.scss'
import RegisterForm from '@/components/register/RegisterForm'
import GoogleRegisterButton from '@/components/register/GoogleRegisterButton'

const RegisterPage = () => {
  const admins = process.env.NEXT_PUBLIC_ADMINS?.split(',') || []

  return (
    <div className={styles.registerContainer}>
      <h1>Create Your Account</h1>
      <RegisterForm admins={admins} />
      <div className="social-register">
        <GoogleRegisterButton admins={admins} />
      </div>
    </div>
  )
}

export default RegisterPage
