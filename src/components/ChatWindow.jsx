import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const chatBoxRef = useRef(null);

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(API_KEY);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
  });

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setMessages([
      { sender: 'bot', text: "Hello!! How can I assist you today?" }
    ]);
  }, []);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessageText = userInput;
    setMessages(prev => [...prev, { sender: 'user', text: userMessageText }]);
    setUserInput('');

    setMessages(prev => [...prev, { sender: 'bot', text: 'Searching...', type: 'typing' }]);

    const history = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
    history.push({ role: 'user', parts: [{ text: userMessageText }] });

    try {
      const result = await model.generateContent({ contents: history });
      const response = result.response.text();

      setMessages(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;

        if (updated[lastIndex]?.type === 'typing') {
          updated[lastIndex] = { sender: 'bot', text: response };
        } else {
          updated.push({ sender: 'bot', text: response });
        }

        return updated;
      });
    } catch (err) {
      console.error("API Error:", err);
      setMessages(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (updated[lastIndex]?.type === 'typing') {
          updated[lastIndex] = {
            sender: 'bot',
            text: '❌ Error: Failed to get response. Try again.'
          };
        }
        return updated;
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  const handleCopyChat = () => {
    const chatText = messages.map(m => `${m.sender === 'user' ? '👦 You' : '🤖 BrainFuel'}: ${m.text}`).join('\n');
    navigator.clipboard.writeText(chatText)
      .then(() => alert("Chat copied to clipboard!"))
      .catch(() => alert("Failed to copy chat"));
  };

  return (
    <div className="right">
      <div className="profile">
        <div className="copy" onClick={handleCopyChat}>Copy Chat</div>
        <p className='ai'>Your AI-powered study buddy</p>
      </div>

      <div className="message-area">
        <div className="text-area" ref={chatBoxRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`chat-bubble ${msg.sender}`}>
              <div className="bubble">{msg.text}</div>
            </div>
          ))}
        </div>

        <div className="type-message">
          <input
            type="text"
            className="ask"
            placeholder="Ask anything..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="ask2">
            <button className="button" onClick={sendMessage}>
              <svg xmlns="http://www.w3.org/2000/svg" className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <footer className="chat-footer">
        © 2025 <strong>ReviseMate</strong> | Made by <a href="https://github.com/akhileshverma-gh" target="_blank" rel="noopener noreferrer">Akhilesh Verma</a>
      </footer>
    </div>
  );
}

export default ChatWindow;
