import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai'; 

function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const chatBoxRef = useRef(null); 

  // Gemini API setup
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    setMessages(prevMessages => [...prevMessages, { sender: 'user', text: userInput }]);
    const userMessage = userInput;
    setUserInput(''); // Clear input immediately

    // Show Searching
    setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: 'Searching...', type: 'typing' }]);

    // Prepare history for Gemini
    const history = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
    history.push({ role: 'user', parts: [{ text: userMessage }] }); // Add current user message

    try {
      const result = await model.generateContent({ contents: history });
      const response = result.response.text();

      // Update the Searching message with the actual response
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        const lastMessageIndex = newMessages.length - 1;
        if (newMessages[lastMessageIndex].type === 'typing') {
          newMessages[lastMessageIndex] = { sender: 'bot', text: response };
        } else {
          newMessages.push({ sender: 'bot', text: response });
        }
        return newMessages;
      });
    } catch (err) {
      console.error(err);
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        const lastMessageIndex = newMessages.length - 1;
        if (newMessages[lastMessageIndex].type === 'typing') {
          newMessages[lastMessageIndex] = { sender: 'bot', text: '❌ Error: Failed to get response.' };
        } else {
          newMessages.push({ sender: 'bot', text: '❌ Error: Failed to get response.' });
        }
        return newMessages;
      });
    }
  };

  const handleCopyChat = () => {
    const textToCopy = messages.map(msg => {
      const prefix = msg.sender === 'user' ? '👦 You: ' : '🤖 NovaChat: ';
      return `${prefix}${msg.text}`;
    }).join('\n');

    if (textToCopy.trim() === "") {
      alert("No chat to copy!");
      return;
    }

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        alert("Copied!"); 
      })
      .catch(err => {
        alert("Failed to copy chat.");
        console.error(err);
      });
  };

  const UserProfileIcon = () => (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );

  const SendArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-up">
      <line x1="12" y1="19" x2="12" y2="5"></line>
      <polyline points="5 12 12 5 19 12"></polyline>
    </svg>
  );

  return (
    <div className="right">
      <div className="profile">
        <div id="copy-btn" className="copy" onClick={handleCopyChat}>Copy</div>
        <div className="login">
          <span className="dot">...</span>
          <div className="svg">
            <UserProfileIcon />
          </div>
        </div>
      </div>
      <div className="message-area">
        <div className="text-area" id="chat-box" ref={chatBoxRef}>
          {messages.map((msg, index) => (
            <div key={index} className={msg.sender === 'user' ? 'user-message' : 'bot-message'}>
              {msg.sender === 'user' ? '👦 You: ' : '🤖 NovaChat: '}
              {msg.text}
            </div>
          ))}
        </div>
        <div className="type-message">
          <input
            type="text"
            id="user-input"
            placeholder="Ask me anything"
            className="ask"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
          />
          <div className="ask2">
            <button className="button" onClick={sendMessage}>
              <SendArrowIcon className="arrow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;