'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, onSnapshot, getDoc } from 'firebase/firestore'
import { useUser } from '@/hooks/useUser'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './Chat.module.scss' // Импортируем стили через CSS-модули

const Chat = () => {
  const [chats, setChats] = useState<any[]>([])
  const [loadingChats, setLoadingChats] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [userDetails, setUserDetails] = useState<Map<string, { name: string; avatar: string }>>(
    new Map(),
  )
  const { user, loading: userLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (userLoading) return

    if (!user) {
      setError('You must be logged in to view this page.')
      router.push('/login')
      return
    }

    const userChatsDoc = doc(db, 'userchats', user.uid)

    const unsubscribe = onSnapshot(
      userChatsDoc,
      async (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data()
          if (data?.chats) {
            setChats(data.chats)
            await fetchReceiverDetails(data.chats)
          } else {
            setChats([])
          }
        } else {
          setError('No chats found')
        }
        setLoadingChats(false)
      },
      (err) => {
        setError('Error fetching chats: ' + err)
        setLoadingChats(false)
      },
    )

    return () => unsubscribe()
  }, [user, userLoading, router])

  const fetchReceiverDetails = async (chats: any[]) => {
    const newDetails = new Map(userDetails)

    for (let chat of chats) {
      if (!newDetails.has(chat.receiverId)) {
        const userDoc = doc(db, 'users', chat.receiverId)
        const userSnapshot = await getDoc(userDoc)

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data()
          newDetails.set(chat.receiverId, {
            name: userData?.name || 'Unknown',
            avatar: userData?.avatar || '/default-avatar.png', // Fallback to default avatar
          })
        }
      }
    }

    setUserDetails(newDetails)
  }

  const getReceiverName = (receiverId: string) => {
    const receiver = userDetails.get(receiverId)
    return receiver?.name || 'Receiver Name'
  }

  const getReceiverImage = (receiverId: string) => {
    const receiver = userDetails.get(receiverId)
    return receiver?.avatar || '/default-avatar.png'
  }

  if (userLoading || loadingChats) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className={styles.chatContainer}>
      <h1>Your Chats</h1>
      {chats.length === 0 ? (
        <p>No chats available</p>
      ) : (
        <ul className={styles.chatList}>
          {chats.map((chat, index) => {
            const chatStatusClass = chat.isSeen ? styles.seen : styles.unseen

            return (
              <li key={index} className={`${styles.chatItem} ${chatStatusClass}`}>
                <div className={styles.chatHeader}>
                  <Image
                    width={56}
                    height={56}
                    src={getReceiverImage(chat.receiverId)}
                    alt={getReceiverName(chat.receiverId)}
                    className={styles.chatImage}
                  />
                  <div className={styles.chatInfo}>
                    <h2>{getReceiverName(chat.receiverId)}</h2>
                    <p>{chat.lastMessage}</p>
                    <span
                      
                      className={`${styles.statusIndicator} ${chat.isSeen ? styles.seen : styles.unseen}`}
                    />{console.log(chat.isSeen)}
                  </div>
                </div>
                <p className={styles.lastUpdated}>
                  Last updated: {new Date(chat.updatedAt?.seconds * 1000).toLocaleString()}
                </p>
                <Link href={`/chat/${chat.chatId}`}>
                  <button className={styles.goToChatBtn}>Go to Chat</button>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default Chat
