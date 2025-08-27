import React, { useState, useRef, useEffect } from 'react';
import { syncDataToServer } from './indexedDB/dataSync';
import { askGemini } from '../firebase/AiService';
export const AIAgentSidebar = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setThreadId] = useState(null);
  const messagesEndRef = useRef(null);

  // 🔹 Ref for sidebar
  const sidebarRef = useRef(null);

  // Sync data when component mounts
  useEffect(() => {
    syncDataToServer().catch(console.error);
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🔹 Close sidebar when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        onToggle(); // close sidebar
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape" && isOpen) {
        onToggle();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onToggle]);

  // Send a message
  /* const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const endpoint = threadId ? `/chat/${threadId}` : '/chat';
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.threadId) {
        setThreadId(data.threadId);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
*/
  // Handle enter press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }; 
  const sendMessage = async () => {
  if (!inputMessage.trim()) return;

  const userMessage = inputMessage;
  setInputMessage('');
  setIsLoading(true);

  // Add user message to chat
  setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

  try {
    const reply = await askGemini(userMessage);

    setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
  } catch (error) {
    console.error('Error sending message:', error);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: '⚠️ Sorry, I encountered an error. Please try again.' 
    }]);
  } finally {
    setIsLoading(false);
  }
};

  // Clear chat
  const clearChat = () => {
    setMessages([]);
    setThreadId(null);
  };

  // Refresh data
  const refreshData = async () => {
    try {
      await syncDataToServer();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Data refreshed! I now have the latest information from your IndexedDB.' 
      }]);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Failed to refresh data. Please try again.' 
      }]);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`fixed bottom-4 right-4 z-50 p-3 bg-myBlue text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 ${
          isOpen ? 'rotate-180 opacity-0' : ''
        }`}
        title="Toggle AI Assistant"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z"></path>
        </svg>
      </button>

      {/* Sidebar */}
      <div
        ref={sidebarRef}   // 🔹 attach ref here
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-dullBlue text-white p-4 flex justify-between items-center">
            <h1 className="text-lg font-bold">AI Assistant</h1>
            <div className="flex space-x-2">
              <button
                onClick={refreshData}
                className="px-2 py-1 bg-green-600 rounded text-sm hover:bg-green-700 transition-colors"
                title="Refresh Data"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9ZM19 21H5V3H13V9H19V21Z"></path>
                </svg>
              </button>
              <button
                onClick={clearChat}
                className="px-2 py-1 bg-red-600 rounded text-sm hover:bg-red-700 transition-colors"
                title="Clear Chat"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-darkBlue">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-4">
                <p className="text-sm mb-2">Welcome to your AI Assistant!</p>
                <p className="text-xs">
                  Ask me about your tasks, habits, XP progress, or Pomodoro sessions.
                </p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[200px] px-3 py-2 rounded-lg text-sm ${
                    message.role === 'user'
                      ? 'bg-dullBlue text-white'
                      : 'bg-brightBlue text-white'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-brightBlue text-white px-3 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-myBlue"></div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-dullBlue p-3">
            <div className="flex space-x-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 p-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-myBlue text-darkBlue"
                rows="2"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="px-3 py-2 bg-myBlue text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
