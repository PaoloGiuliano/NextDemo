"use client"; // Ensure this is a client component

import { usePathname } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";
import MyIcon from "../../public/dd-logo.svg";

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
    <nav className="bg-[#15448c] text-white p-4">
      <div className="flex justify-between items-center">
        <Link href={"/"} className="text-2xl font-semibold">
          <img
            src="/dd-logo.svg"
            alt="dd-logo"
            className="p-2 w-32 h-32 filter invert brightness-0 sepia sature-100 hue-rotate-180"
          />
        </Link>
        <ul className="hidden md:flex space-x-6">
          {Links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`capitalize hover:text-gray-400 text-2xl px-4 py-2 rounded ${
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
              className="w-15 h-15 hover:cursor-pointer"
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
          {/* <svg
            version="1.0"
            xmlns="http://www.w3.org/2000/svg"
            width="200"
            height="200"
            viewBox="0 0 200 200"
            preserveAspectRatio="xMidYMid meet"
          >
            <g
              transform="translate(0,200) scale(0.1,-0.1)"
              fill="#FFFFFF"
              stroke="none"
            >
              <path
                d="M177 1813 c-8 -33 -7 -1618 1 -1631 7 -9 92 -12 393 -10 l384 3 0 60
  0 60 -85 17 c-175 36 -347 150 -444 296 -83 125 -116 235 -116 387 0 124 19
  205 72 315 33 69 57 101 132 176 78 78 106 98 186 137 65 32 120 51 175 60
  l80 13 3 67 3 67 -390 0 c-363 0 -390 -1 -394 -17z"
              />
              <path
                d="M1050 1765 c0 -72 -11 -64 105 -85 33 -7 103 -32 155 -57 82 -39 107
  -58 185 -137 144 -145 205 -290 205 -491 0 -121 -18 -200 -66 -299 -96 -196
  -280 -339 -494 -383 l-85 -18 0 -60 0 -60 42 2 c56 2 246 67 308 105 262 161
  384 357 415 669 15 152 -21 333 -92 457 -96 169 -249 299 -421 358 -72 25
  -221 64 -244 64 -9 0 -13 -20 -13 -65z"
              />
              <path
                d="M860 1584 c-310 -81 -506 -387 -446 -695 43 -217 192 -385 413 -466
  75 -27 118 -30 127 -7 3 9 6 279 6 600 l0 584 -22 -1 c-13 0 -48 -7 -78 -15z
  m-8 -581 c2 -258 1 -471 -2 -476 -8 -10 -74 18 -125 53 -146 100 -216 235
  -218 415 -1 123 24 207 88 294 63 85 189 180 242 181 8 0 12 -122 15 -467z"
              />
              <path
                d="M1050 1005 c0 -680 -10 -620 96 -592 228 59 402 239 449 465 29 135
  13 257 -52 392 -46 97 -156 209 -259 262 -64 34 -172 67 -216 68 -17 0 -18
  -35 -18 -595z m202 430 c105 -59 189 -159 227 -273 29 -86 29 -238 0 -324 -26
  -79 -77 -156 -142 -214 -52 -47 -161 -109 -176 -100 -4 3 -6 214 -4 469 1 255
  3 467 3 472 0 11 42 -2 92 -30z"
              />
            </g>
          </svg> */}
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
                className={`capitalize block text-gray-300 hover:text-white py-2 px-4 rounded ${
                  pathname === link.href
                    ? "underline font-bold text-gray-100" // Active link styles
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
