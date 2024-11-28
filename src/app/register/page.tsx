'use client'

import styles from './RegisterPage.module.scss'
import RegisterForm from '@/components/register/RegisterForm'
import GoogleRegisterButton from '@/components/register/GoogleRegisterButton'

const RegisterPage = () => {

  return (
    <div className={styles.registerContainer}>
      <h1>Create Your Account</h1>
      <RegisterForm />
      <div className="social-register">
        <GoogleRegisterButton  />
      </div>
    </div>
  )
}

export default RegisterPage
