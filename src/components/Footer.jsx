import React from "react";
import { Facebook, Twitter, Instagram, Mail } from "react-feather";

const Footer = () => (
  <footer className="bg-indigo-900 text-white py-10 mt-16 w-full">
    <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
      {/* Brand & Copyright */}
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-bold mb-2">ShopEase</h2>
        <p className="text-sm text-indigo-200">
          &copy; {new Date().getFullYear()} ShopEase. All rights reserved.
        </p>
      </div>
      {/* Links */}
      <div className="flex flex-col md:flex-row gap-6 text-center">
        <a href="/about" className="hover:underline text-indigo-200">
          About Us
        </a>
        <a href="/contact" className="hover:underline text-indigo-200">
          Contact
        </a>
        <a href="/terms" className="hover:underline text-indigo-200">
          Terms
        </a>
        <a href="/privacy" className="hover:underline text-indigo-200">
          Privacy Policy
        </a>
      </div>
      {/* Social */}
      <div className="flex gap-4 justify-center">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <Facebook size={22} className="hover:text-indigo-300" />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
        >
          <Twitter size={22} className="hover:text-indigo-300" />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <Instagram size={22} className="hover:text-indigo-300" />
        </a>
        <a href="mailto:support@shopease.com" aria-label="Email">
          <Mail size={22} className="hover:text-indigo-300" />
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
