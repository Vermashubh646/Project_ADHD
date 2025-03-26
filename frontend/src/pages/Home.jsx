import Hero from "../components/Home/HeroSection";
import KeyFeatures from "../components/Home/KeyFeatures";
import WhyChooseUs from "../components/Home/WhyChooseUs";
import HowItWorks from "../components/Home/HowItWorks";
import FAQ from "../components/Home/FAQ";
import CTA from "../components/Home/CTA";
import Footer from "../components/Home/Footer";
import ScrollProgress from "../components/Shared/ScrollProgress";

const Home = () => {
  return (
    <div className="w-full min-h-screen bg-gray-100 overflow-hidden">
    {/* <ScrollProgress /> */}
    <Hero/>
    <KeyFeatures />
    <WhyChooseUs />
    <HowItWorks />
    <FAQ />
    <CTA />
    <Footer />
  </div>
  );
};

export default Home;
