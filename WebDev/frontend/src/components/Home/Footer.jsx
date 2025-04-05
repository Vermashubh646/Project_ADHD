import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gray-800 py-8 text-gray-300">
      <div className="container mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-bold mb-3">About Us</h3>
          <p className="text-sm">A smart platform designed to enhance focus, productivity, and task management.</p>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-3">Quick Links</h3>
          <ul>
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/features" className="hover:text-white">Features</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-3">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white"><i className="fab fa-facebook"></i></a>
            <a href="#" className="hover:text-white"><i className="fab fa-twitter"></i></a>
            <a href="#" className="hover:text-white"><i className="fab fa-linkedin"></i></a>
          </div>
        </div>
      </div>
      <div className="text-center mt-6 text-sm text-gray-500">&copy; {new Date().getFullYear()} MindSync. All Rights Reserved.</div>
    </footer>
  );
}

export default Footer;
