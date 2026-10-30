import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import About from "../components/About";
import Contact from "../components/Contact";
import Gallery from "../components/Gallery";
import Hero from "../components/Hero";
import Services from "../components/Services";
import Testimonials from "../components/Testimonials";
import Training from "../components/Training";
import WhyUs from "../components/WhyUs";

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!target) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    const id = window.setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(id);
  }, [location.state]);

  return (
    <main id="main">
      <Hero />
      <About />
      <Services />
      <WhyUs />
      <Gallery />
      <Training />
      <Testimonials />
      <Contact />
    </main>
  );
}
