import { motion } from "framer-motion";

const reasons = [
  {
    title: "Personalized Experience",
    icon: "🙌",
    description: "Tailored recommendations based on your study habits.",
  },
  {
    title: "Distraction-Free Learning",
    icon: "🚫",
    description: "Advanced AI to detect distractions and keep you focused.",
  },
  {
    title: "Boosted Productivity",
    icon: "⚡",
    description: "Stay on track and accomplish more with minimal effort.",
  },
  {
    title: "In-App Study Modes",
    icon: "🎓",
    description: "Study from PDFs or YouTube videos within the app.",
  },
];

// Scroll Animation Variants
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } },
};

const WhyChooseUs = () => {
  return (
    <section
      className="py-16 text-gray-900"
      style={{
        backgroundImage: "url('/ghibli2.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Heading */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-4xl font-extrabold text-white">Why Choose Us?</h2>
        <p className="text-black mt-2 text-lg">
          Our platform helps you stay focused and productive effortlessly.
        </p>
      </motion.div>

      {/* Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {reasons.map((reason, index) => (
          <motion.div
            key={index}
            className="p-8 bg-white rounded-xl text-center shadow-lg transition-all relative flex flex-col items-center"
            whileHover={{
              scale: 1.08,
              y: -5,
              boxShadow: "0px 10px 20px rgba(255, 140, 0, 0.3)",
            }}
            variants={cardVariants}
          >
            {/* Animated Icon */}
            <motion.div
              className="text-5xl mb-4"
              whileHover={{ scale: 1.2, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {reason.icon}
            </motion.div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-800">{reason.title}</h3>
            {/* Description */}
            <p className="text-gray-700 mt-2">{reason.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default WhyChooseUs;
