export default function Footer() {
  return (
    <footer className="text-white py-6">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm md:text-md font-Poppins">
          &copy; {new Date().getFullYear()} RecargasXtreme. Todos los derechos
          reservados.
        </p>
        <p className="text-sm md:text-md font-Poppins">
          Made with 💛 by Deyver Reyes Faria
        </p>
      </div>
    </footer>
  );
}
