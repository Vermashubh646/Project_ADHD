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

const WhyChooseUs = () => {
  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold">Why Choose Us?</h2>
        <p className="text-gray-400 mt-2">
          Our platform helps you stay focused and productive effortlessly.
        </p>
      </div>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-8"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {reasons.map((reason, index) => (
          <motion.div
            key={index}
            className="p-6 bg-gray-800 rounded-lg text-center shadow-lg hover:scale-105 transition"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-4xl">{reason.icon}</div>
            <h3 className="text-xl font-semibold mt-4">{reason.title}</h3>
            <p className="text-gray-400 mt-2">{reason.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default WhyChooseUs;
