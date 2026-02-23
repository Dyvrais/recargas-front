import { useState } from "react";
import Navbar from "./components/Navbar";
import "./App.css";
import Products from "./components/ProductListing";
import Gallery from "./components/Gallery";
import Section from "./components/Section";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import WalletsListing from "./components/WalletsListing";
import StreamingListing from "./components/StreamingListing";

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <Gallery />
      <Products />
      <WalletsListing />
      <StreamingListing />
      <Section />
      <Footer />
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default App;
