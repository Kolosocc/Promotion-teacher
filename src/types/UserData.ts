import { User as FirebaseUser } from 'firebase/auth'
export interface UserData {
  name: string
  email: string
  avatar?: string
}

export type UserRole = string | null

export interface UseUserData {
  user: FirebaseUser | null
  userData: UserData | null
  userRole: UserRole
  loading: boolean
}
