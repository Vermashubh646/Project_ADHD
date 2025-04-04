import { motion } from "framer-motion";

const steps = [
  {
    step: "1",
    title: "Create & Manage Tasks",
    description: "Add tasks with priority, due dates, and categories. Drag and drop to reorder tasks.",
  },
  {
    step: "2",
    title: "Enter Focus Mode",
    description: "Start a focus session and choose your study mode (PDF or YouTube).",
  },
  {
    step: "3",
    title: "Get AI Assistance",
    description: "Use the Gemini Assistant for quick help and task suggestions.",
  },
];

function HowItWorks() {
  return (
    <section
      className="py-20 bg-gradient-to-b from-gray-900"
      style={{
        backgroundImage: "url('/ghibli3.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container mx-auto px-8">
        <h2 className="text-4xl font-bold text-center text-white mb-12">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <div className="text-4xl font-bold text-blue-500 mb-4">{step.step}</div>
              <h3 className="text-2xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-700">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
