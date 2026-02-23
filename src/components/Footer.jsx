export default function Footer() {
  return (
    <footer className="text-white md:w-screen mt-8 py-6">
      <div className="max-w-7xl text-gray-400 mx-auto px-4 text-center">
        <p className="text-sm md:text-md font-Poppins">
          &copy; {new Date().getFullYear()} RecargasXtreme. Todos los derechos
          reservados.
        </p>
        <p className="text-sm md:text-md mt-1 font-Poppins">
          Las marcas y logotipos de juegos son propiedad de sus respectivos
          dueños.
        </p>
        <p className="text-sm md:text-md mt-2 font-Poppins">
          Made with 💛 by Codenver
        </p>
      </div>
    </footer>
  );
}
