'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, onSnapshot, updateDoc, Timestamp, getDoc } from 'firebase/firestore'
import { useUser } from '@/hooks/useUser'

const ChatPage = () => {
  const { chatId } = useParams() // Получаем chatId из URL
  const [chat, setChat] = useState<any | null>(null) // Стейт для чата
  const [messages, setMessages] = useState<any[]>([]) // Стейт для сообщений
  const [messageText, setMessageText] = useState('') // Текст сообщения
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resivedId, setResivedId] = useState()

  const user = useUser()

  useEffect(() => {
    if (!chatId || !user) return // Если chatId или user отсутствуют, выходим

    // Преобразуем chatId в строку, если это массив
    const chatIdStr = Array.isArray(chatId) ? chatId[0] : chatId

    // Получаем данные чата в реальном времени
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

    // Очистка подписки при размонтировании компонента
    return () => unsubscribe()
  }, [chatId, user]) // Загружаем данные чата при изменении chatId или user

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
      let receiverId = null // Инициализируем receiverId
  
      if (userChatsSnapshot.exists()) {
        const data = userChatsSnapshot.data()
        if (data?.chats) {
          const updatedChats = data.chats.map((chatItem: any) => {
            if (chatItem.chatId === chatIdStr) {
              receiverId = chatItem.receiverId // Сохраняем receiverId напрямую
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
  
      if (receiverId) { // Используем receiverId напрямую, не через состояние
        const receiverUserChatsDocRef = doc(db, 'userchats', receiverId)
        console.log(receiverUserChatsDocRef)
        const receiverUserChatsSnapshot = await getDoc(receiverUserChatsDocRef)
        console.log(receiverUserChatsSnapshot)
        if (receiverUserChatsSnapshot.exists()) {
          const receiverData = receiverUserChatsSnapshot.data()

          if (receiverData?.chats) {
            const updatedReceiverChats = receiverData.chats.map((receiverChat: any) => {
              if (receiverChat.chatId === chatIdStr) {
                console.log(receiverChat)
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
  
  if (loading) {
    return <div>Loading chat...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div>
      <h1>Chat: {chat?.chatId}</h1>
      <div>
        <h2>Messages</h2>
        <div>
          {messages.map((msg, index) => {
            const createdAt =
              msg.createdAt instanceof Timestamp ? msg.createdAt.toDate() : msg.createdAt
            return (
              <div key={index}>
                <p>
                  {msg.senderId === user?.uid ? 'You: ' : 'Admin: '}
                  {msg.text}
                </p>
                <p>{createdAt?.toString()}</p> {/* Если createdAt существует, выводим дату */}
              </div>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSendMessage}>
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder='Write a message...'
        />
        <button type='submit'>Send</button>
      </form>
    </div>
  )
}

export default ChatPage
