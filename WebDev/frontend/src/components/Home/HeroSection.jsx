import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function HeroSection() {
  return (
    <section
      className="relative h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center text-white"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
          Boost Your Focus & Productivity
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          Smart tools to manage tasks, track progress, and stay distraction-free.
        </p>
        <Link to="/dashboard">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get Started
          </motion.button>
        </Link>
      </motion.div>
    </section>
  );
}

export default HeroSection;
