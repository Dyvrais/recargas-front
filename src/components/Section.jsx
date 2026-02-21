import React from "react";
import { FaWhatsapp, FaFacebook, FaInstagram } from "react-icons/fa";
export default function Section() {
  return (
    <section
      id="about-me"
      className="flex flex-col w-screen max-w-screen md:mt-12 justify-center items-center scroll-mt-20 scroll-smooth"
    >
      <h2 className="font-Melon tracking-wide font-bold text-center text-white mt-6 text-lg md:text-2xl">
        SOBRE NOSOTROS
      </h2>
      <p className="text-gray-400 text-center max-w-xl text-sm md:text-base px-4 mt-2">
        Tu portal de confianza para recargas y saldo digital. Sin
        complicaciones, entregas rápidas y atención personalizada 24/7.
      </p>
      <h2 className="font-Melon tracking-wide font-bold text-center text-white mt-8 text-lg md:text-2xl">
        SOPORTE
      </h2>
      <a
        href="https://wa.me/+584122188263"
        className="text-black bg-yellow-500 mt-2 hover:bg-yellow-600 px-4 py-2 rounded-lg transition-colors duration-200"
      >
        <FaWhatsapp className="inline-block mr-2 text-xl" />
        Contáctanos
      </a>
      <h2 className="font-Melon tracking-wide font-bold text-center text-white mt-8 text-lg md:text-2xl">
        HORARIOS DE SOPORTE
      </h2>
      <p className="text-gray-400 text-center max-w-xl text-sm md:text-base px-4 mt-2">
        11:00 AM - 11:00 PM
      </p>
      <h2 className="font-Melon tracking-wide font-bold text-center text-white mt-8 mb-2 text-lg md:text-2xl">
        SÍGUENOS
      </h2>
      <div className="flex space-x-4">
        <a
          href="https://www.facebook.com/share/182wPNreDS/"
          target="_blank"
          className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
        >
          <FaFacebook className="text-2xl" />
        </a>
        <a
          href="https://www.instagram.com/recargasxtreme_?igsh=ZHlic2d0aG1qNmd0"
          target="_blank"
          className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
        >
          <FaInstagram className="text-2xl" />
        </a>
        <a
          href="https://whatsapp.com/channel/0029Vb7NWy7D8SDvcVXmWT1F"
          target="_blank"
          className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
        >
          <FaWhatsapp className="text-2xl" />
        </a>
      </div>
    </section>
  );
}
