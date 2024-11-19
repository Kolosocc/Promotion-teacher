import { auth, db, storage } from '@/lib/firebase'
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  collection,
  addDoc,
  Timestamp,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

export const registerUserWithEmailPassword = async (
  email: string,
  password: string,
  name: string,
  avatar: File | null
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  await updateProfile(user, { displayName: name })

  let avatarURL = ''
  if (avatar) {
    const avatarRef = ref(storage, `avatars/${user.uid}/`)
    const uploadTask = uploadBytesResumable(avatarRef, avatar)
    await uploadTask
    avatarURL = await getDownloadURL(avatarRef)
  }

  await setDoc(doc(db, 'users', user.uid), {
    email: user.email,
    name,
    avatar: avatarURL,
  })

  return user
}

export const registerUserWithGoogle = async (avatar: File | null) => {
  const provider = new GoogleAuthProvider()
  const userCredential = await signInWithPopup(auth, provider)
  const user = userCredential.user

  let avatarURL = user.photoURL || ''
  if (avatar) {
    const avatarRef = ref(storage, `avatars/${user.uid}/`)
    const uploadTask = uploadBytesResumable(avatarRef, avatar)
    await uploadTask
    avatarURL = await getDownloadURL(avatarRef)
  }

  await setDoc(doc(db, 'users', user.uid), {
    email: user.email,
    name: user.displayName,
    avatar: avatarURL,
  })

  return user
}

export const initializeUserChats = async (userId: string, admins: string[]) => {
  const chatPromises = admins.map(async (adminId) => {
    const newChatDoc = await addDoc(collection(db, 'chats'), {
      createdAt: Timestamp.fromDate(new Date()),
      messages: [
        {
          createdAt: Timestamp.fromDate(new Date()),
          senderId: adminId,
          text: `Привет, как вы могли понять я админ. Меня можно найти по нику Admin. Вы всегда сможете связаться со мной через домашнюю страницу.`,
        },
      ],
    })

    return { chatId: newChatDoc.id, adminId }
  })

  const chatData = await Promise.all(chatPromises)

  const userChats = chatData.map(({ chatId, adminId }) => ({
    chatId,
    isSeen: false,
    lastMessage: `Привет, как вы могли понять я админ. Меня можно найти по нику Admin. Вы всегда сможете связаться со мной через домашнюю страницу.`,
    receiverId: adminId,
    updatedAt: Timestamp.fromDate(new Date()),
  }))

  await setDoc(doc(db, 'userchats', userId), { chats: userChats })

  const adminPromises = chatData.map(async ({ chatId, adminId }) => {
    const adminUserDoc = doc(db, 'userchats', adminId)
    await updateDoc(adminUserDoc, {
      chats: arrayUnion({
        chatId,
        isSeen: true,
        lastMessage: `Привет, как вы могли понять я админ. Меня можно найти по нику Admin. Вы всегда сможете связаться со мной через домашнюю страницу.`,
        receiverId: userId,
        updatedAt: Timestamp.fromDate(new Date()),
      }),
    })
  })

  await Promise.all(adminPromises)
}
