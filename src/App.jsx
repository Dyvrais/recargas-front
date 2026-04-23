import { useState } from "react";
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

  return (
    <>
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <Gallery />
      <Products />
      <GiftCardsListing />
      <StreamingListing />
      <WalletsListing />
      <Section />
      <SupportButtons classname="absolute top-4 right-4" />
      <Footer />
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default App;
