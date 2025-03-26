import React from "react";
import Gemini from "../../assets/Gemini.png"
import "./AssistantIcon.css";

const AssistantIcon = ({ toggleChat }) => {
  return (
    <div className="assistant-icon" onClick={toggleChat}>
      <img
        src={Gemini}
        alt="Gemini Icon"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default AssistantIcon;
