import { FaRegClock, FaTasks, FaRobot, FaYoutube, FaClipboardList, FaRegCalendarAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const features = [
  {
    icon: <FaRegClock />,
    title: "Auto-Extend Focus Timer",
    description: "Extend your session automatically if deep focus is detected.",
  },
  {
    icon: <FaClipboardList />,
    title: "Task Management & Drag/Drop",
    description: "Easily manage, sort, and rearrange your tasks with drag-and-drop.",
  },
  {
    icon: <FaYoutube />,
    title: "PDF & YouTube Study Mode",
    description: "Study from PDFs or YouTube videos in a distraction-free environment.",
  },
  {
    icon: <FaRobot />,
    title: "AI-Powered Gemini Assistant",
    description: "Get instant help and guidance with Gemini's AI-powered suggestions.",
  },
  {
    icon: <FaRegCalendarAlt />,
    title: "Google Calendar Integration",
    description: "Seamlessly schedule tasks and sync with your Google Calendar.",
  },
  {
    icon: <FaTasks />,
    title: "Session Summary Insights",
    description: "Get post-session insights to improve focus and productivity.",
  },
];

function KeyFeatures() {
  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-8">
        <h2 className="text-4xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-5xl text-blue-400 mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default KeyFeatures;
