import { User as FirebaseUser } from 'firebase/auth'
export interface UserData {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

export type UserRole = string | null

export interface UseUserData {
  user: FirebaseUser | null
  userData: UserData | null
  userRole: UserRole
  loading: boolean
}
