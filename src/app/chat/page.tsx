'use client'

import React, { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { useUser } from '@/hooks/useUser'
import Link from 'next/link'

const Chat = () => {
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const user = useUser()

  useEffect(() => {
    if (!user) return

    const userChatsDoc = doc(db, 'userchats', user.uid)

    const unsubscribe = onSnapshot(
      userChatsDoc,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data()
          if (data?.chats) {
            setChats(data.chats)
          } else {
            setChats([])
          }
        } else {
          setError('No chats found')
        }
        setLoading(false)
      },
      (err) => {
        setError('Error fetching chats: ' + err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  const handleChatClick = async (chatId: string) => {
    if (!user) return

    try {
      const userChatsDoc = doc(db, 'userchats', user.uid)

      const updatedChats = chats.map((chat: any) => {
        if (chat.chatId === chatId) {
          return { ...chat, isSeen: true }
        }
        return chat
      })

      await updateDoc(userChatsDoc, { chats: updatedChats })
    } catch (err) {
      setError('Error updating chat status: ' + err)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div>
      <h1>Your Chats</h1>
      {chats.length === 0 ? (
        <p>No chats available</p>
      ) : (
        <ul>
          {chats.map((chat, index) => (
            <li key={index}>
              <p>Chat ID: {chat.chatId}</p>
              <p>isSeen: {chat.isSeen ? 'true' : 'false'}</p>
              <p>Last message: {chat.lastMessage}</p>
              <p>Last updated: {chat.updatedAt?.toDate().toString()}</p>
              <Link href={`/chat/${chat.chatId}`}>
                <button onClick={() => handleChatClick(chat.chatId)}>Go to Chat</button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Chat
