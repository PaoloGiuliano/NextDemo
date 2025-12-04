"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";

const Links = [
  { href: "/tasks", text: "tasks" },
  { href: "/insights", text: "insights" },
];

const Navbar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const sizeClass = isMobile ? "h-10 w-10" : "h-15 w-15";

  return (
    <nav className="bg-[#15448c] p-4 text-white">
      <div className="flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="text-2xl font-semibold">
          <img
            src="/dd-logo.svg"
            alt="dd-logo"
            className={`sature-100 ${sizeClass} brightness-0 hue-rotate-180 invert sepia filter`}
          />
        </Link>

        {/* DESKTOP NAV + USER INFO (only when logged in) */}
        {session && (
          <div className="hidden items-center space-x-6 md:flex">
            {/* NAV LINKS */}
            <ul className="flex space-x-6">
              {Links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`rounded px-4 py-2 text-2xl capitalize hover:text-gray-400 ${
                      pathname === link.href
                        ? "bg-[#2b5594] text-gray-100"
                        : "text-gray-300"
                    }`}
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>

            {/* USER NAME */}
            <span className="text-xl font-medium text-gray-100 underline">
              {user?.name || user?.email}
            </span>

            {/* LOGOUT BUTTON */}
            <button
              onClick={() => signOut()}
              className="rounded bg-blue-500 px-4 py-2 text-xl hover:cursor-pointer hover:bg-blue-600"
            >
              Logout
            </button>
          </div>
        )}

        {/* MOBILE MENU BUTTON (only when logged in) */}
        {session && (
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-white">
              <svg
                className="h-10 w-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
        )}
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {session && (
        <div
          className={`md:hidden ${
            isMenuOpen ? "block" : "hidden"
          } bg-[#2b5594] py-4`}
        >
          {/* USER NAME MOBILE */}
          {user && (
            <div className="flex items-center px-4 pb-4">
              <span className="text-lg font-medium text-gray-100">
                {user.name || user.email}
              </span>
            </div>
          )}

          {/* NAV LINKS */}
          <ul className="space-y-4 text-left">
            {Links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block rounded px-4 py-2 capitalize hover:text-white ${
                    pathname === link.href
                      ? "font-bold text-gray-100 underline"
                      : "text-gray-300"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.text}
                </Link>
              </li>
            ))}

            {/* MOBILE LOGOUT */}
            <li>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  signOut();
                }}
                className="block w-full px-4 py-2 text-left text-red-300 hover:text-red-500"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
