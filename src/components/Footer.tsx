"use client"; // Mark this as a client component

import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-12">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Left Section: Internal Links */}
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-semibold">Internal Resources</h3>
            <ul className="space-y-2 mt-2 text-center">
              <li>
                <a href="/docs" className="hover:text-gray-400">
                  Documentation
                </a>
              </li>
              <li>
                <a href="/projects" className="hover:text-gray-400">
                  Projects Dashboard
                </a>
              </li>
              <li>
                <a href="/tasks" className="hover:text-gray-400">
                  Task Management
                </a>
              </li>
            </ul>
          </div>

          {/* Center Section: Quick Links */}
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-semibold">Quick Links</h3>
            <ul className="text-center space-y-2 mt-2">
              <li>
                <a href="/about" className="hover:text-gray-400">
                  About Us
                </a>
              </li>
              <li>
                <a href="/support" className="hover:text-gray-400">
                  Support & Help
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-gray-400">
                  Contact Team
                </a>
              </li>
            </ul>
          </div>

          {/* Right Section: Team Info */}
          <div className="text-center md:text-right">
            <h3 className="text-xl font-semibold">Team Resources</h3>
            <ul className="text-center space-y-2 mt-2">
              <li>
                <a href="/internal-chat" className="hover:text-gray-400">
                  Internal Chat
                </a>
              </li>
              <li>
                <a href="/wiki" className="hover:text-gray-400">
                  Internal Wiki
                </a>
              </li>
              <li>
                <a href="/status" className="hover:text-gray-400">
                  System Status
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="border-t border-gray-600 mt-6 pt-4 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Your Company. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
