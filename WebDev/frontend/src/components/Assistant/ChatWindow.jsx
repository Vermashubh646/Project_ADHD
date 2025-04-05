import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaExpandAlt, FaCompressAlt } from "react-icons/fa";
import Gemini from "../../assets/Gemini.png"
import "./ChatWindow.css";

const ChatWindow = ({ closeChat }) => {
    const [messages, setMessages] = useState(() => {
        const savedMessages = sessionStorage.getItem("focusChatHistory");
        return savedMessages ? JSON.parse(savedMessages) : [];
      });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // ✅ Expand/Collapse State
  const chatRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // ✅ Handle sending message on Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // ✅ Clean and format Gemini's response properly
const cleanResponse = (text) => {
    // Convert **bold text** to <b>text</b>
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // Handle bold
      .replace(/\*(.*?)\*/g, "<i>$1</i>") // Handle italic if present
      .replace(/\\n/g, "<br/>") // Handle line breaks
      .replace(/- /g, "<li>") // Convert lists (Markdown style)
      .replace(/\n/g, "<br/>"); // Handle additional newlines
  
    // Wrap list items in <ul> if list detected
    if (formattedText.includes("<li>")) {
      formattedText = `<ul>${formattedText.replace(/<li>(.*?)<br\/>/g, "<li>$1</li>")}</ul>`;
    }
  
    // Trim and clean unwanted spaces
    return formattedText.trim();
  };
  // Add this function to save messages to sessionStorage
const saveToSession = (newMessages) => {
    sessionStorage.setItem("focusChatHistory", JSON.stringify(newMessages));
  };
  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user's message
    const userMessage = { text: input, sender: "user" };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveToSession(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/gemini`, { userMessage: input });
      const rawResponse =
        res.data.candidates[0]?.content?.parts[0]?.text || "I'm here to help! 😊";

      // Format and clean the response before displaying
      const formattedResponse = cleanResponse(rawResponse);

      const botMessage = {
        text: formattedResponse,
        sender: "gemini",
      };
      const newMessages = [...updatedMessages, botMessage];
        setMessages(newMessages);
        saveToSession(newMessages);
    } catch (error) {
      console.error("Error fetching from Gemini API:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, I encountered an error. Please try again.", sender: "gemini" },
      ]);
    }

    setIsTyping(false);
  };
  // Toggle Expand State
  const toggleExpand = () => setIsExpanded((prev) => !prev);

  return (
    <div className={`chat-window ${isExpanded ? "expanded" : ""}`}>
      <div className="chat-header">
      <img src={Gemini} alt="Gemini Icon" className="gemini-icon" />
        <span>Gemini Assistant</span>
        <div className="chat-controls">
          <button className="expand-btn" onClick={toggleExpand}>
            {isExpanded ? <FaCompressAlt /> : <FaExpandAlt />} {/* ✅ Icons */}
          </button>
          <button className="close-btn" onClick={closeChat}>
            ✕
          </button>
        </div>
      </div>

      {/* Chat Body */}
      <div className="chat-body" ref={chatRef}>
      {messages.map((msg, index) => (
  <div
    key={index}
    className={`chat-message ${msg.sender === "user" ? "user" : "gemini"}`}
    dangerouslySetInnerHTML={{ __html: msg.text }}
  />
))}
        {isTyping && <div className="typing-indicator">Gemini is typing...</div>}
      </div>

      {/* Chat Footer */}
      <div className="chat-footer">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress} // ✅ Trigger on Enter
          placeholder="Ask something..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;
