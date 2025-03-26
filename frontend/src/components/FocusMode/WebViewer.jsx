import React, { useState } from "react";

const WebViewer = ({ onClose }) => {
  const [webUrl, setWebUrl] = useState("");
  const [validUrl, setValidUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Basic URL validation (allowing any valid URL)
  const validateUrl = (url) => {
    const pattern = /^(https?:\/\/)?(www\.)?([\w-]+(\.[\w-]+)+)(\/.*)?$/;
    return pattern.test(url);
  };

  // Handle Load Button
  const handleLoadUrl = () => {
    if (validateUrl(webUrl)) {
      // Add 'https://' if not already present
      let formattedUrl = webUrl.startsWith("http") ? webUrl : `https://${webUrl}`;
  
      // ✅ Use the Puppeteer proxy
      const proxyUrl = `http://localhost:5000/proxy?url=${encodeURIComponent(formattedUrl)}`;
  
      setIsLoading(true);
      console.log("Loading URL via Puppeteer Proxy:", proxyUrl);
  
      setTimeout(() => {
        setValidUrl(proxyUrl); // Load the proxied page
        setIsLoading(false);
      }, 500);
    } else {
      alert("Invalid URL. Please enter a valid link.");
    }
  };

  // Handle Reload
  const handleReload = () => {
    setIsLoading(true);
    setTimeout(() => {
      setValidUrl(null);
      setTimeout(() => setValidUrl(webUrl), 100);
      setIsLoading(false);
    }, 200);
  };

  // Handle Back to Input Screen
  const handleBackToInput = () => {
    setValidUrl(null); // Go back to input, not Study Mode
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      {validUrl ? (
        // Display Web Content with Iframe
        <div className="flex flex-col items-center justify-center w-[90%] max-w-[900px] h-[85vh] bg-gray-900 rounded-2xl shadow-lg relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-white text-lg">Loading...</span>
            </div>
          ) : (
            <iframe
              src={validUrl}
              title="Study Website"
              className="w-full h-full rounded-2xl"
              onError={() => alert("Unable to load this URL. It may be blocking iframes.")}
            />
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleReload}
              className="text-white bg-gray-700 px-6 py-2 rounded-lg hover:bg-gray-600 transition-all"
            >
              🔄 Reload
            </button>
            <button
              onClick={handleBackToInput}
              className="text-white bg-gray-700 px-6 py-2 rounded-lg hover:bg-gray-600 transition-all"
            >
              ↩ Back
            </button>
            <button
              onClick={onClose}
              className="text-white bg-red-600 px-6 py-2 rounded-lg hover:bg-red-500 transition-all"
            >
               Exit
            </button>
          </div>
        </div>
      ) : (
        // URL Input Section
        <div className="h-full flex flex-col items-center justify-center gap-6 p-6 bg-black bg-opacity-50 rounded-xl backdrop-blur-lg shadow-xl">
          <h2 className="text-white text-2xl font-semibold">🌐 Study from Web</h2>

          {/* Input Field */}
          <input
            type="text"
            placeholder="Enter URL (e.g., https://example.com)"
            value={webUrl}
            onChange={(e) => setWebUrl(e.target.value)}
            className="w-full p-3 bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleLoadUrl}
            className="w-3/4 text-white bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
          >
            🌐 Load Website
          </button>

          <button
            onClick={onClose}
            className="w-3/4 text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500 transition-all"
          >
            ❌ Exit
          </button>
        </div>
      )}
    </div>
  );
};

export default WebViewer;
