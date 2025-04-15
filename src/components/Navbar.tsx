"use client"; // Ensure this is a client component

import { usePathname } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const Links = [
  { href: "/tasks", text: "tasks" },
  { href: "/insights", text: "insights" },
];

const Navbar = () => {
  const pathname = usePathname(); // Get the current pathname
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to toggle menu visibility
  const [isMobile, setIsMobile] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle the state
  };

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);
  const sizeClass = isMobile ? "h-20 w-20" : "h-32 w-32";

  return (
    <nav className="bg-[#15448c] p-4 text-white">
      <div className="flex items-center justify-between">
        <Link href={"/"} className="text-2xl font-semibold">
          <img
            src="/dd-logo.svg"
            alt="dd-logo"
            className={`sature-100 ${sizeClass} h-20 w-20 p-2 brightness-0 hue-rotate-180 invert sepia filter`}
          />
        </Link>
        <ul className="hidden space-x-6 md:flex">
          {Links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`rounded px-4 py-2 text-2xl capitalize hover:text-gray-400 ${
                  pathname === link.href
                    ? "bg-[#2b5594] text-gray-100" // Active link styles
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
              className="h-15 w-15 hover:cursor-pointer"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.3"
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
        } bg-[#2b5594] py-4`}
      >
        <ul className="space-y-4 text-left">
          {Links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block rounded px-4 py-2 text-gray-300 capitalize hover:text-white ${
                  pathname === link.href
                    ? "font-bold text-gray-100 underline" // Active link styles
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
