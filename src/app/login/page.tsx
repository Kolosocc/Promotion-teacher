"use client";

import React, { useEffect, useState } from "react";
import LoginForm from "@/components/login/LoginForm";
import GoogleLoginButton from "@/components/login/GoogleLoginButton";
import Link from "next/link";

const LoginPage = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="login-container">
      <h1>Login</h1>
      <LoginForm />
      <div>
        <p>Or sign in with:</p>
        <GoogleLoginButton />
      </div>

      <Link href="/forgot-password">
        <p>Забыли пароль</p>
      </Link>
    </div>
  );
};

export default LoginPage;
