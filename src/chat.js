// src/Chat.js

import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaSpinner, FaArrowLeft, FaComment, FaRobot, FaUser } from 'react-icons/fa';
import { GoogleGenerativeAI } from "@google/generative-ai";
import AnimatedBackground from './AnimatedBackground';

const Chat = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const [history, setHistory] = useState([
    {
      role: 'model',
      text: 'Hello there! How can I help you today?'
    }
  ]);

  // --- IMPORTANT: PASTE YOUR API KEY HERE ---
  const API_KEY = "AIzaSyCMm6-3tygv527JBvGVo5axfxBOdyCAiVk";
  // -----------------------------------------
  
  const genAI = new GoogleGenerativeAI(API_KEY);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', text: input };
    setHistory(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const result = await model.generateContent(input);
      const response = await result.response;
      const text = response.text();
      
      const modelMessage = { role: 'model', text };
      setHistory(prev => [...prev, modelMessage]);

    } catch (error) {
      console.error("Error with Gemini API:", error);
      const errorMessage = { role: 'model', text: 'Sorry, I ran into an error. Please check the API key and console.' };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white relative">
      <AnimatedBackground />

      {/* This div structures the entire page vertically */}
      <div className="relative z-10 h-screen flex flex-col">

        {/* Header */}
        <header className="p-4 flex items-center bg-gray-900 bg-opacity-50 backdrop-blur-sm flex-shrink-0">
          <div className="max-w-4xl mx-auto w-full flex items-center gap-4">
            <button onClick={onClose} className="back-button">
              <FaArrowLeft className="text-xl" />
            </button>
            <h1 className="text-xl font-bold text-gray-200">AI Assistant</h1>
          </div>
        </header>

        {/* Chat History (Scrollable middle section) */}
        <main className="flex-grow overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 space-y-6">
            {history.map((msg, index) => {
              if (msg.role === 'user') {
                return (
                  <div key={index} className="flex justify-end items-end gap-3 animate-chat-bubble">
                    <div className={`p-3 rounded-lg max-w-lg whitespace-pre-wrap bg-blue-600`}>
                      {msg.text}
                    </div>
                    <div className="avatar user-avatar-bg">
                      <FaUser className="text-white" />
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={index} className="flex justify-start items-end gap-3 animate-chat-bubble">
                    <div className="avatar ai-avatar-bg">
                      <FaRobot className="text-purple-300" />
                    </div>
                    <div className={`p-3 rounded-lg max-w-lg whitespace-pre-wrap bg-gray-700`}>
                      {msg.text}
                    </div>
                  </div>
                );
              }
            })}
            {isLoading && (
              <div className="flex justify-start animate-chat-bubble">
                <div className="p-3 rounded-lg bg-gray-700">
                  <FaSpinner className="animate-spin" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </main>

        {/* Input Footer (Pinned to the bottom) */}
        <footer className="p-4 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex-shrink-0">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <FaComment className="text-xl text-gray-400" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-transform focus:scale-[1.02]"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              className="p-4 bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-500 transition-transform hover:scale-110 hover:-translate-y-1"
              disabled={isLoading || !input.trim()}
            >
              <FaPaperPlane />
            </button>
          </div>
        </footer>
        
      </div>
    </div>
  );
};

export default Chat;