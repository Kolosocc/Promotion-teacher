import { useUnit } from 'effector-react'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { $userData, fetchUserDataFx, resetUserData } from '@/models/userModel'
import { User as FirebaseUser, IdTokenResult } from 'firebase/auth'
import { UserData, UserRole, UseUserData } from '@/types/UserData'

const useUserData = (): UseUserData => {
  const userData = useUnit($userData) as UserData | null
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        try {
          await fetchUserDataFx(currentUser)
          const tokenResult: IdTokenResult = await currentUser.getIdTokenResult()
          const role = tokenResult.claims.role as string | undefined
          setUserRole(role || null)
        } catch (error) {
          console.error('Error fetching user data or role:', error)
        }
      } else {
        resetUserData()
        setUserRole(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, userData, userRole, loading }
}

export default useUserData
