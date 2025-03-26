import { useEffect, useState } from "react";

function SoftLockWarning({ distractionCount }) {
  const [warningLevel, setWarningLevel] = useState(null);

  useEffect(() => {
    if (distractionCount >= 7) {
      setWarningLevel("high"); // Persistent strong warning
    } else if (distractionCount >= 5) {
      setWarningLevel("medium"); // Stronger warning
    } else if (distractionCount >= 2) {
      setWarningLevel("low"); // Subtle warning
    } else {
      setWarningLevel(null); // No warning
    }
  }, [distractionCount]);

  return (
    <div className="fixed top-0 left-0 w-full z-50 text-center p-2 transition-all duration-300"
      style={{
        backgroundColor:
          warningLevel === "high" ? "red" :
          warningLevel === "medium" ? "orange" :
          warningLevel === "low" ? "yellow" : "transparent",
        color: warningLevel ? "black" : "transparent",
        fontWeight: "bold",
      }}
    >
      {warningLevel === "low" && "⚠️ Stay Focused!"}
      {warningLevel === "medium" && "⚠️ Frequent distractions detected!"}
      {warningLevel === "high" && "⛔ Too many distractions! Regain focus!"}
    </div>
  );
}

export default SoftLockWarning;
