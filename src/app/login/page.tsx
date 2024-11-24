'use client'

import React from 'react'
import styles from './LoginPage.module.scss'
import LoginForm from '@/components/login/LoginForm'
import GoogleLoginButton from '@/components/login/GoogleLoginButton'

const LoginPage = () => (
  <div className={styles.loginContainer}>
    <h1>Sign in to Your Account</h1>
    <LoginForm />
    <div className="social-login">
      <GoogleLoginButton />
    </div>
  </div>
)

export default LoginPage
