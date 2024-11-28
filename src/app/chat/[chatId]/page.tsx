'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, onSnapshot, updateDoc, Timestamp, getDoc } from 'firebase/firestore'
import { useUser } from '@/hooks/useUser'
import styles from './ChatId.module.scss'

const ChatPage = () => {
  const { chatId } = useParams()
  const [chat, setChat] = useState<any | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user, loading: userLoading } = useUser()

  useEffect(() => {
    if (!chatId || !user) return

    const chatIdStr = Array.isArray(chatId) ? chatId[0] : chatId

    const chatDocRef = doc(db, 'chats', chatIdStr)

    const unsubscribe = onSnapshot(chatDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const chatData = docSnapshot.data()
        setChat(chatData)
        setMessages(chatData.messages || [])
      } else {
        setError('Chat not found')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [chatId, user])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!messageText.trim() || !chatId || !user) return

    try {
      const chatIdStr = Array.isArray(chatId) ? chatId[0] : chatId
      const chatDocRef = doc(db, 'chats', chatIdStr)

      await updateDoc(chatDocRef, {
        messages: [
          ...messages,
          {
            createdAt: Timestamp.fromDate(new Date()),
            senderId: user.uid,
            text: messageText,
          },
        ],
      })

      const userChatsDocRef = doc(db, 'userchats', user.uid)
      const userChatsSnapshot = await getDoc(userChatsDocRef)
      let receiverId = null

      if (userChatsSnapshot.exists()) {
        const data = userChatsSnapshot.data()
        if (data?.chats) {
          const updatedChats = data.chats.map((chatItem: any) => {
            if (chatItem.chatId === chatIdStr) {
              receiverId = chatItem.receiverId
              return {
                ...chatItem,
                isSeen: true,
                lastMessage: messageText,
                updatedAt: Timestamp.fromDate(new Date()),
              }
            }
            return chatItem
          })

          await updateDoc(userChatsDocRef, { chats: updatedChats })
        }
      }

      if (receiverId) {
        const receiverUserChatsDocRef = doc(db, 'userchats', receiverId)
        const receiverUserChatsSnapshot = await getDoc(receiverUserChatsDocRef)
        if (receiverUserChatsSnapshot.exists()) {
          const receiverData = receiverUserChatsSnapshot.data()

          if (receiverData?.chats) {
            const updatedReceiverChats = receiverData.chats.map((receiverChat: any) => {
              if (receiverChat.chatId === chatIdStr) {
                return {
                  ...receiverChat,
                  isSeen: false,
                  lastMessage: messageText,
                  updatedAt: Timestamp.fromDate(new Date()),
                }
              }
              return receiverChat
            })

            await updateDoc(receiverUserChatsDocRef, { chats: updatedReceiverChats })
          }
        }
      }

      setMessageText('')
    } catch (error) {
      setError('Error sending message: ' + error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e as unknown as React.FormEvent)
    }
  }

  if (loading || userLoading) {
    return <div>Loading chat...</div>
  }

  if (error) {
    return <div className={styles.error}>{error}</div>
  }

  return (
    <div className={styles.chatContainer}>
      <h1 className={styles.chatTitle}>Chat: {chat?.chatId}</h1>
      <div className={styles.messagesSection}>
        <h2>Messages</h2>
        <div>
          {messages.map((msg, index) => {
            const createdAt =
              msg.createdAt instanceof Timestamp ? msg.createdAt.toDate() : msg.createdAt
            return (
              <div
                key={index}
                className={msg.senderId === user?.uid ? styles.sentMessage : styles.receivedMessage}
              >
                <p
                  className={styles.messageText}
                  dangerouslySetInnerHTML={{
                    __html: msg.text.replace(/\n/g, '<br />'),
                  }}
                ></p>
                <p className={styles.timestamp}>{createdAt?.toString()}</p>
              </div>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSendMessage} className={styles.formSection}>
        <textarea
          className={styles.textarea}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message... (Shift + Enter for new line)"
        />
        <button className={styles.submitButton} type="submit">
          Send
        </button>
      </form>
    </div>
  )
}

export default ChatPage
