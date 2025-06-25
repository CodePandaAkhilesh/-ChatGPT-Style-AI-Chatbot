import React from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import '../styles.css'; 

function ChatApp() {
  return (
    <div className="main-container">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}

export default ChatApp;