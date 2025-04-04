import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function CallToAction() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center relative"
    style={{
      backgroundImage: "url('/ghibli3.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      <h2 className="text-4xl font-bold mb-6">Ready to Improve Your Productivity?</h2>
      <p className="text-lg mb-8">Sign up now and take the first step toward achieving your goals!</p>
      <Link to="/dashboard">
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="bg-white text-blue-600 px-6 py-3 text-lg font-bold rounded-full shadow-lg transition-all duration-300"
        >
          Get Started
        </motion.button>
      </Link>
    </section>
  );
}

export default CallToAction;
