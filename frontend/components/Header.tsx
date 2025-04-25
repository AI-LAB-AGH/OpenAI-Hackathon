"use client";
import React, { useState } from "react";
import Link from "next/link";
import { HiMenu, HiX } from "react-icons/hi";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center relative">
      <div className="flex items-center">
        <Link
          href="/"
          className="text-xl font-semibold text-gray-800 hover:text-gray-600"
        >
          AAA
        </Link>
      </div>

      {/* Desktop navigation - hidden on mobile */}
      <nav className="hidden md:block">
        <ul className="flex space-x-6">
          <li>
            <Link href="/chat" className="text-gray-600 hover:text-gray-900">
              Chat
            </Link>
          </li>
          <li>
            <Link href="/notes" className="text-gray-600 hover:text-gray-900">
              Notes
            </Link>
          </li>
        </ul>
      </nav>

      {/* Hamburger menu button - visible only on mobile */}
      <button
        className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
      </button>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full right-0 left-0 bg-white shadow-md z-10 border-t border-gray-200">
          <nav className="py-2">
            <ul className="flex flex-col">
              <li>
                <Link
                  href="/chat"
                  className="block px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Chat
                </Link>
              </li>
              <li>
                <Link
                  href="/notes"
                  className="block px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Notes
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
