import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import "./App.css";
import Products from "./components/ProductListing";
import Gallery from "./components/Gallery";
import Section from "./components/Section";
import Footer from "./components/Footer";
import Cart from "./components/Cart";

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <Gallery />
      <Products />
      {/* <Section /> */}
      <Footer />
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default App;
