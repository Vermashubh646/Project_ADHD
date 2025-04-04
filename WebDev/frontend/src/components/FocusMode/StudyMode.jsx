import React, { useState } from "react";
import PDFViewer from "./PDFViewer";
import YouTubePlayer from "./YouTubePlayer";
import { FaYoutube } from "react-icons/fa";
import "./StudyMode.css";

const StudyMode = () => {
  const [selectedMode, setSelectedMode] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  // Handle PDF selection
  const handlePDFSelection = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPdfFile(file);
      setSelectedMode("pdf");
    }
  };

  return (
    <div className="study-mode-container">
      {selectedMode === "pdf" && pdfFile ? (
        <PDFViewer file={pdfFile} onClose={() => setSelectedMode(null)} />
      ) : selectedMode === "youtube" ? (
        <YouTubePlayer onClose={() => setSelectedMode(null)} />
      ) : (
        <div className="study-mode-box">
          {/* Heading */}
          <h2 className="study-mode-heading">📚 Choose Your Study Mode</h2>

          {/* PDF Mode */}
          <button
            onClick={() => document.getElementById("pdfInput").click()}
            className="study-mode-btn"
          >
            📄 Study from PDF
          </button>
          <input
            type="file"
            accept="application/pdf"
            id="pdfInput"
            className="hidden"
            onChange={handlePDFSelection}
          />

          {/* YouTube Mode */}
          <button
            onClick={() => setSelectedMode("youtube")}
            className="study-mode-btn youtube-btn"
          >
            <FaYoutube size={24} className="youtube-icon" /> Study from YouTube
          </button>

          {/* Info Text */}
          <p className="study-mode-info">
            Choose a mode to start your focused study session.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudyMode;
