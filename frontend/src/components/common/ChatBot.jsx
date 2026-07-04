import React, { useEffect, useRef, useState } from 'react'
import { IoChatbubblesOutline } from 'react-icons/io5'
import { AiOutlineClose, AiOutlineSend } from 'react-icons/ai'
import { sendChatMessage } from '../../services/operations/chatServices'

const WELCOME_MESSAGE = "Hi! I'm the Logic Labs Ed assistant 👋 Ask me anything about our platform, courses, enrollment, or how to get started!";
const CONNECTION_ERROR_MESSAGE = 'Connection error. Please check your internet and try again.';
const MAX_MESSAGE_LENGTH = 500;

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'bot', text: WELCOME_MESSAGE }]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    const result = await sendChatMessage(trimmed);

    setMessages((prev) => [
      ...prev,
      { role: 'bot', text: result.success ? result.reply : CONNECTION_ERROR_MESSAGE }
    ]);
    setLoading(false);
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className='fixed bottom-6 left-6 z-50' >

      {
        isOpen && (
          <div className='absolute bottom-[calc(100%+1rem)] left-0 w-[320px] sm:w-[360px] h-[460px] bg-richblack-900 rounded-xl shadow-lg flex flex-col overflow-hidden' >

            {/* Header */}
            <div className='bg-yellow-50 flex items-center justify-between px-4 py-3' >
              <div className='flex items-center gap-2 text-richblack-900 font-bold' >
                <IoChatbubblesOutline className='text-xl' />
                Logic Labs Ed Assistant
              </div>

              <button onClick={() => setIsOpen(false)} aria-label='Close chat' >
                <AiOutlineClose className='text-richblack-900 text-xl' />
              </button>
            </div>

            {/* Messages */}
            <div className='flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2' >
              {
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`max-w-[80%] px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'self-end bg-yellow-50 text-richblack-900 rounded-xl rounded-br-none'
                        : 'self-start bg-richblack-800 text-richblack-25 rounded-xl rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))
              }

              {
                loading && (
                  <div className='self-start bg-richblack-800 rounded-xl rounded-bl-none px-4 py-3 flex gap-1' >
                    <span className='h-2 w-2 rounded-full bg-richblack-25 animate-bounce' style={{ animationDelay: '0ms' }} ></span>
                    <span className='h-2 w-2 rounded-full bg-richblack-25 animate-bounce' style={{ animationDelay: '150ms' }} ></span>
                    <span className='h-2 w-2 rounded-full bg-richblack-25 animate-bounce' style={{ animationDelay: '300ms' }} ></span>
                  </div>
                )
              }

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className='bg-richblack-800 p-3 flex items-center gap-2' >
              <input
                type='text'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                maxLength={MAX_MESSAGE_LENGTH}
                placeholder='Type your message...'
                className='flex-1 bg-richblack-700 text-richblack-5 text-sm rounded-lg px-3 py-2 placeholder:text-richblack-400 focus:outline-none disabled:cursor-not-allowed'
              />

              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                aria-label='Send message'
                className='shrink-0 grid place-items-center h-9 w-9 rounded-full bg-yellow-50 text-richblack-900 disabled:cursor-not-allowed disabled:opacity-50'
              >
                <AiOutlineSend className='text-lg' />
              </button>
            </div>
          </div>
        )
      }

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        className='h-14 w-14 rounded-full bg-yellow-50 text-richblack-900 grid place-items-center shadow-lg text-2xl'
      >
        {
          isOpen ? <AiOutlineClose /> : <IoChatbubblesOutline />
        }
      </button>
    </div>
  )
}

export default ChatBot
