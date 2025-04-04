import { useState } from "react";

const faqs = [
  {
    question: "What is Focus Mode?",
    answer:
      "Focus Mode helps you stay productive by blocking distractions and tracking your study performance.",
  },
  {
    question: "How does AI-powered distraction detection work?",
    answer:
      "Our AI model analyzes your environment and alerts you when distractions occur to help maintain focus.",
  },
  {
    question: "Can I customize my focus sessions?",
    answer:
      "Yes! You can adjust session duration, study modes, and enable smart reminders to fit your workflow.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely! Your personal data and session details are encrypted and stored securely.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      className="py-16 bg-white text-black"
      style={{
        backgroundImage: "url('/ghibli2.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold">Frequently Asked Questions</h2>
        <p className="mt-2">Find answers to common questions.</p>
      </div>
      <div className="max-w-3xl mx-auto space-y-4 px-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-lg cursor-pointer border border-gray-300"
          >
            <div
              className="flex justify-between items-center"
              onClick={() => toggleFAQ(index)}
            >
              <h3 className="text-lg font-semibold">{faq.question}</h3>
              <span className="text-xl">
                {openIndex === index ? "−" : "+"}
              </span>
            </div>
            {openIndex === index && <p className="mt-2">{faq.answer}</p>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
