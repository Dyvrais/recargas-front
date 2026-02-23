"use client";

import { useState } from "react";
import logoLocal from "../assets/logo.png";
import { IoCartOutline } from "react-icons/io5";
import { IoIosMenu, IoMdClose } from "react-icons/io";

export default function Navbar({ onCartClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* NAVBAR */}
      <nav className="z-50 bg-[#08090a] fixed top-0 inset-x-0 bg-repeat py-4 px-4 shadow-md backdrop-blur-md md:py-3">
        <div className="mx-auto px-2 flex items-center w-full">
          {/* Left: Hamburger (mobile) */}
          <div className="flex items-center">
            <button
              onClick={() => setMenuOpen((s) => !s)}
              aria-expanded={menuOpen}
              aria-label="Toggle menu"
              className="md:hidden text-yellow-500 text-3xl mr-3"
            >
              {menuOpen ? <IoMdClose /> : <IoIosMenu />}
            </button>
          </div>

          {/* Center: Title (mobile-first, centered) */}
          <div className="md:flex-1 m-auto justify-center items-center md:text-left md:pl-4">
            <img src={logoLocal} alt="Logo" className="h-10 w-auto" />
          </div>

          {/* Right: Desktop menu + Cart */}
          <div className="flex items-center space-x-4">
            <ul className="hidden md:flex items-center justify-center space-x-6 md:space-x-10 font-Noto text-md font-bold text-white">
              <li className="text-shadow hover:underline hover:scale-110 transition-transform">
                <a className="scroll-smooth" href="#juegos">
                  JUEGOS
                </a>
              </li>
              <li className="text-shadow hover:underline hover:scale-110 transition-transform">
                <a className="scroll-smooth" href="#wallets">
                  WALLETS
                </a>
              </li>
              <li className="text-shadow hover:underline hover:scale-110 transition-transform">
                <a className="scroll-smooth" href="#streaming">
                  STREAMING
                </a>
              </li>
            </ul>

            <button
              aria-label="View cart"
              onClick={onCartClick}
              className="inline-flex items-center px-3 py-2 rounded-md transition-transform"
            >
              <IoCartOutline className="text-yellow-500 text-xl font-bold md:text-3xl" />
            </button>
          </div>
        </div>

        {/* Mobile menu - slides down */}
        <div
          className={`md:hidden overflow-hidden bg-[#08090a] backdrop-blur transition-max-h duration-300 ${
            menuOpen ? "max-h-60" : "max-h-0"
          }`}
        >
          <ul className="flex flex-col items-center space-y-4 py-2 font-Noto text-md text-yellow-500">
            <li className="w-full text-center  hover:bg-[#fec135] hover:text-white transition">
              <a href="#juegos" onClick={() => setMenuOpen(false)}>
                JUEGOS
              </a>
              <div className="w-3/4 m-auto border-t border-gray-300 mt-3"></div>
            </li>
            <li className="w-full text-center  hover:bg-[#fec135] hover:text-white transition">
              <a href="#wallets" onClick={() => setMenuOpen(false)}>
                WALLETS
              </a>
              <div className="w-3/4 m-auto border-t border-gray-300 mt-3"></div>
            </li>
            <li className="w-full text-center  hover:bg-[#fec135] hover:text-white transition">
              <a href="#streaming" onClick={() => setMenuOpen(false)}>
                STREAMING
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
