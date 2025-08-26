import React, { useState, useRef, useEffect } from 'react';
import { syncDataToServer } from './indexedDB/dataSync';

export const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const messagesEndRef = useRef(null);

  // Sync data when component mounts to ensure latest data is available
  useEffect(() => {
    syncDataToServer().catch(console.error);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
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
      
      // Set thread ID if this is a new conversation
      if (data.threadId) {
        setThreadId(data.threadId);
      }

      // Add AI response to chat
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setThreadId(null);
  };

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
    <div className="flex flex-col h-screen bg-lightGray">
      {/* Header */}
      <div className="bg-darkGray text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">AI Assistant</h1>
        <div className="flex space-x-2">
          <button
            onClick={refreshData}
            className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 transition-colors"
          >
            Refresh Data
          </button>
          <button
            onClick={clearChat}
            className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition-colors"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-2">Welcome to your AI Assistant!</p>
            <p className="text-sm">
              Ask me about your tasks, habits, XP progress, or Pomodoro sessions.
            </p>
            <p className="text-sm mt-2">
              I have access to your real-time data and can help you with productivity insights.
            </p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-myBlue text-white'
                  : 'bg-white text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-myBlue"></div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white p-4 border-t">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your tasks, habits, or productivity..."
            className="flex-1 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-myBlue"
            rows="2"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-2 bg-myBlue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
