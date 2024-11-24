// src/models/userModel.ts

import { createStore, createEffect, createEvent } from 'effector'
import { User } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { UserData } from '@/types/UserData'

export const fetchUserDataFx = createEffect(async (user: User) => {
  const userDocRef = doc(db, 'users', user.uid)
  const docSnap = await getDoc(userDocRef)

  if (docSnap.exists()) {
    return docSnap.data() as UserData
  } else {
    const defaultUserData: UserData = {
      email: user.email || '',
      name: user.displayName || '',
      avatar: '',
    }
    await setDoc(userDocRef, defaultUserData)
    console.log(defaultUserData)
    return defaultUserData
  }
})

export const setUserData = createEvent<UserData>()
export const resetUserData = createEvent()

export const $userData = createStore<UserData | null>(null)
  .on(fetchUserDataFx.doneData, (_, userData) => userData)
  .on(setUserData, (_, userData) => userData)
  .reset(resetUserData)

  
