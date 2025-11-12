import React from "react";
import { Link } from "react-router-dom";
import { 
  FiGithub, 
  FiTwitter, 
  FiLinkedin, 
  FiMail,
  FiHeart,
  FiArrowUp,
  FiShoppingBag
} from "react-icons/fi";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const socialLinks = [
    {
      icon: <FiGithub className="w-4 h-4" />,
      url: "https://github.com/Gokul331",
      label: "GitHub"
    },
    {
      icon: <FiLinkedin className="w-4 h-4" />,
      url: "https://linkedin.com/in/gokul-palanisamy-422b6b363",
      label: "LinkedIn"
    },
    {
      icon: <FiTwitter className="w-4 h-4" />,
      url: "https://twitter.com",
      label: "Twitter"
    },
    {
      icon: <FiMail className="w-4 h-4" />,
      url: "mailto:gokulece303@gmail.com",
      label: "Email"
    }
  ];

  const quickLinks = [
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
    { path: "/privacy", label: "Privacy Policy" },
    { path: "/terms", label: "Terms of Service" },
    { path: "/shipping", label: "Shipping Info" },
    { path: "/returns", label: "Returns" }
  ];

  const customerService = [
    { path: "/help", label: "Help Center" },
    { path: "/track-order", label: "Track Order" },
    { path: "/size-guide", label: "Size Guide" },
    { path: "/faq", label: "FAQ" }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white mt-auto border-t border-gray-700">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          
          {/* Brand Section */}
          <div className="md:grid-cols-2 lg:col-span-2 flex flex-col items-center">
            <div className="flex gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiShoppingBag className="text-white text-lg" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                ShopEase
              </h3>
            </div>
            <p className="text-gray-300 mb-3 text-sm lg:text-base leading-relaxed ">
              Your one-stop destination for modern e-commerce. Built with cutting-edge 
              technologies to deliver the best shopping experience.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-800/50 hover:bg-indigo-600 rounded-xl text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-110 hover:shadow-lg border border-gray-700 hover:border-indigo-500 flex items-center justify-center"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:grid-cols-2 flex flex-col items-center">
            <h4 className="text-lg font-semibold mb-3 text-white flex lg:self-start lg:px-24 mx-2  items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              Quick Links
            </h4>
            <ul className="flex flex-wrap gap-3 underline items-center justify-center">
              {quickLinks.slice(0, 4).map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-white transition-all duration-200 text-sm lg:text-base block  hover:translate-x-1 hover:font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="md:grid-cols-2 flex flex-col items-center">
            <h4 className="text-lg font-semibold mb-2 text-white flex items-center lg:self-start lg:px-28 mx-3  gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Customer Service
            </h4>
            <ul className="flex flex-wrap gap-3 underline items-center justify-center">
              {customerService.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-white transition-all duration-200 text-sm lg:text-base block hover:translate-x-1 hover:font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Technology Stack */}
          <div className="md:grid-cols-1 lg:col-span-2 flex flex-col lg:items-start items-center lg:px-24 lg:mx-2">
            <h4 className="text-lg font-semibold mb-2 text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Built With
            </h4>
            <div className="flex flex-wrap gap-3 text-sm text-gray-300">
              {[
                { name: "React.js", color: "bg-blue-500" },
                { name: "Django REST", color: "bg-green-500" },
                { name: "Tailwind CSS", color: "bg-purple-500" },
                { name: "JWT Auth", color: "bg-red-500" },
                { name: "Vite", color: "bg-yellow-500" },
                { name: "PostgreSQL", color: "bg-indigo-500" }
              ].map((tech, index) => (
                <div key={index} className="flex items-center gap-2 group">
                  <div className={`w-2 h-2 ${tech.color} rounded-full flex-shrink-0 group-hover:scale-125 transition-transform duration-200`}></div>
                  <span className="group-hover:text-white transition-colors duration-200">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700/50 mt-4 lg:mt-5 pt-4 lg:pt-4">
          <div className="flex flex-col lg:flex-col justify-between items-center gap-3">
            
            {/* Copyright */}
            <div className="flex flex-col sm:flex-row items-center gap-3 text-gray-300 text-sm text-center lg:text-left order-2 lg:order-1">
              <span>© {currentYear} ShopEase. All rights reserved.</span>
              <span className="hidden sm:inline text-gray-600">•</span>
              <div className="flex items-center gap-1.5">
                Made with 
                <FiHeart className="text-red-500 animate-pulse flex-shrink-0" size={16} />
                by Gokul Palanisamy
              </div>
            </div>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg group text-sm font-medium order-1 lg:order-2 w-full lg:w-auto justify-center"
              aria-label="Back to top"
            >
              <span>Back to Top</span>
              <FiArrowUp className="group-hover:-translate-y-1 transition-transform duration-300 flex-shrink-0" size={16} />
            </button>
          </div>
        </div>

      
      </div>

      {/* Mobile Bottom Padding */}
      <div className="h-4 lg:h-0"></div>
    </footer>
  );
};

export default Footer;