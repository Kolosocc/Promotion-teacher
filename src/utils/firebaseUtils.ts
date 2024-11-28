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
  getDocs,
} from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

export const registerUserWithEmailPassword = async (
  email: string,
  password: string,
  name: string,
  avatar: File | null,
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

export const initializeUserChats = async (userId: string) => {
  try {
    const admins = await getAdminsFromFirestore()
    console.log(admins)

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
  } catch (error) {
    console.error('Error initializing user chats:', error)
    throw new Error('Failed to initialize user chats.')
  }
}

export const updateProfileInFirestore = async (
  uid: string,
  newName: string,
  newAvatarURL: string,
) => {
  try {
    const userRef = doc(db, 'users', uid)
    await setDoc(userRef, { name: newName, avatar: newAvatarURL }, { merge: true })
  } catch (error) {
    console.error('Error updating profile in Firestore:', error)
    throw new Error('Error updating profile in Firestore')
  }
}

export const updateAvatarInFirestore = async (uid: string, avatarFile: File) => {
  try {
    const avatarRef = ref(storage, `avatars/${uid}/`)
    const uploadTask = uploadBytesResumable(avatarRef, avatarFile)

    await uploadTask
    const avatarURL = await getDownloadURL(avatarRef)
    return avatarURL
  } catch (error) {
    console.error('Error uploading avatar to Firebase Storage:', error)
    throw new Error('Error uploading avatar to Firebase Storage')
  }
}

export const getAdminsFromFirestore = async () => {
  try {
    const adminsCollectionRef = collection(db, 'admins')
    const querySnapshot = await getDocs(adminsCollectionRef)

    const adminUIDs = querySnapshot.docs.map((doc) => doc.id)
    return adminUIDs
  } catch (error) {
    console.error('Error fetching admins from Firestore:', error)
    throw new Error('Failed to fetch admin UIDs from Firestore.')
  }
}
