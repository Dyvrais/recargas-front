import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import "./App.css";
import Products from "./components/GamesListing";
import Gallery from "./components/Gallery";
import Section from "./components/Section";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import WalletsListing from "./components/WalletsListing.v1";
import StreamingListing from "./components/StreamingListing.v1";
import GiftCardsListing from "./components/GiftCardsListingv=1";
import SupportButtons from "./components/SupportButtons";

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const toggleCategory = (category) => () => {
    setSelectedCategory((current) => (current === category ? null : category));
  };

  const isCategoryVisible = (category) =>
    selectedCategory === null || selectedCategory === category;

  const buttonClass = (category) =>
    `border rounded-xl px-3 py-2 transition ${
      selectedCategory === category
        ? "bg-yellow-500 text-black"
        : "hover:bg-white/10"
    }`;

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handle);
  }, [search]);

  return (
    <>
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <Gallery />
      <div id="categorias" className="md:w-screen">
        <div className="flex flex-col items-center gap-4 my-6 md:flex-row md:justify-center">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[80%] md:w-[50%] max-w-md p-2 border border-gray-300 rounded-lg bg-zinc-800 text-white"
            placeholder="🔍 Buscar en todas las categorías..."
          />
        </div>
        <ul className="flex flex-wrap text-white m-auto justify-center gap-2 text-xs md:text-lg font-Noto font-bold">
          <button
            onClick={toggleCategory("juegos")}
            className={buttonClass("juegos")}
          >
            Juegos
          </button>
          <button
            onClick={toggleCategory("gift-cards")}
            className={buttonClass("gift-cards")}
          >
            Gift Cards
          </button>
          <button
            onClick={toggleCategory("streaming")}
            className={buttonClass("streaming")}
          >
            Streaming
          </button>
          <button
            onClick={toggleCategory("wallets")}
            className={buttonClass("wallets")}
          >
            Wallets
          </button>
        </ul>
      </div>
      {isCategoryVisible("juegos") && <Products searchTerm={debouncedSearch} />}
      {isCategoryVisible("gift-cards") && (
        <GiftCardsListing searchTerm={debouncedSearch} />
      )}
      {isCategoryVisible("streaming") && (
        <StreamingListing searchTerm={debouncedSearch} />
      )}
      {isCategoryVisible("wallets") && (
        <WalletsListing searchTerm={debouncedSearch} />
      )}
      <Section />
      <SupportButtons classname="absolute top-4 right-4" />
      <Footer />
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default App;
