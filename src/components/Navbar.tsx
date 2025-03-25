"use client"; // Ensure this is a client component

import { usePathname } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";

const Links = [
  { href: "/tasks", text: "tasks" },
  { href: "/insights", text: "insights" },
];

const Navbar = () => {
  const pathname = usePathname(); // Get the current pathname
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to toggle menu visibility

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle the state
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="flex justify-between items-center">
        <Link href={"/"} className="text-2xl font-semibold">
          Home
        </Link>
        <ul className="hidden md:flex space-x-6">
          {Links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`capitalize hover:text-gray-400 px-4 py-2 rounded ${
                  pathname === link.href
                    ? "bg-gray-600 text-gray-100" // Active link styles
                    : "text-gray-300"
                }`}
              >
                {link.text}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu} // Toggle menu visibility
            className="text-white"
          >
            <svg
              className="w-6 h-6 hover:cursor-pointer"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={`md:hidden ${
          isMenuOpen ? "block" : "hidden"
        } bg-gray-700 py-4`}
      >
        <ul className="space-y-4 text-center">
          {Links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`capitalize block text-white py-2 px-4 rounded ${
                  pathname === link.href
                    ? "bg-gray-600 text-gray-100" // Active link styles
                    : "text-gray-300"
                }`}
                onClick={() => setIsMenuOpen(false)} // Close menu on link click
              >
                {link.text}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
