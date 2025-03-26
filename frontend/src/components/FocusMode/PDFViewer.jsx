import React, { useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Set worker source manually for Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const PDFViewer = ({ file, onClose }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  // Detect when full-screen mode changes
  useEffect(() => {
    const checkFullScreen = () => {
      setIsFullScreen(document.fullscreenElement !== null);
    };

    document.addEventListener("fullscreenchange", checkFullScreen);
    return () => document.removeEventListener("fullscreenchange", checkFullScreen);
  }, []);

  // Zoom In
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3.0));

  // Zoom Out
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  // Toggle Full-Screen Mode
  const handleFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`absolute top-0 left-0 ${isFullScreen ? "w-screen" : "w-1/2"} h-full bg-black z-50 flex flex-col`}
    >
      {/* Control Bar (Spans Full Width in Full-Screen) */}
      <div
        className={`fixed top-0 left-0 ${
          isFullScreen ? "w-screen" : "w-1/2"
        } bg-gray-900 text-white p-2 flex justify-between items-center z-50`}
      >
        <button onClick={onClose} className="bg-gray-700 px-4 py-2 rounded hover:bg-red-600">
          ✖ Close
        </button>
        <div className="flex gap-2">
          <button onClick={handleZoomOut} className="bg-gray-700 px-3 py-2 rounded hover:bg-gray-600">
            ➖ Zoom Out
          </button>
          <button onClick={handleZoomIn} className="bg-gray-700 px-3 py-2 rounded hover:bg-gray-600">
            ➕ Zoom In
          </button>
          <button onClick={handleFullScreen} className="bg-gray-700 px-3 py-2 rounded hover:bg-blue-600">
            {isFullScreen ? "⛶ Exit Full Screen" : "⛶ Full Screen"}
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-grow overflow-y-auto p-4 mt-12">
        {pdfUrl ? (
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading="lazy"
          >
            {Array.from({ length: numPages }, (_, index) => (
              <div key={index} className="flex justify-center py-2">
                <Page
                  pageNumber={index + 1}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  renderMode="canvas" // Enables lazy loading
                />
              </div>
            ))}
          </Document>
        ) : (
          <p className="text-gray-400">Loading PDF...</p>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
