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

// Scroll Animation Variants
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } },
};

function KeyFeatures() {
  return (
    <section
      className="py-20 text-gray-900"
      style={{
        backgroundImage: "url('/ghibli1.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="container mx-auto px-8">
        {/* Heading Animation */}
        <motion.h2
          className="text-4xl font-extrabold text-center text-white mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          Key Features
        </motion.h2>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg text-center relative flex flex-col items-center justify-center transition-all"
              whileHover={{
                scale: 1.07,
                rotate: -1,
                boxShadow: "0px 10px 20px rgba(0, 180, 255, 0.3)",
              }}
              variants={cardVariants}
            >
              {/* Animated Icon */}
              <motion.div
                className="text-5xl text-blue-500 mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-gray-200"
                whileHover={{ scale: 1.2, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {feature.icon}
              </motion.div>

              {/* Title & Description */}
              <h3 className="text-2xl font-bold">{feature.title}</h3>
              <p className="text-gray-800 mt-2">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default KeyFeatures;
