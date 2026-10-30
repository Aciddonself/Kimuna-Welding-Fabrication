import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { lazy, Suspense, useEffect } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { WhatsAppIcon } from "./components/ui";
import i18n from "./i18n";
import { useScrollY, useTheme } from "./lib/hooks";
import Home from "./pages/Home";

const Catalogue = lazy(() => import("./pages/Catalogue"));
const AdminApp = lazy(() => import("./admin/AdminApp"));

function Fabs() {
  const y = useScrollY();
  const show = y > 480;
  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      <AnimatePresence>
        {show && (
          <motion.button
            key="top"
            initial={{ opacity: 0, scale: 0.6, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 12 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            title="Back to top"
            className="glass grid h-11 w-11 place-items-center rounded-full border border-line text-ink shadow-soft transition-colors hover:border-blue hover:text-blue dark:text-white"
          >
            <ArrowUp size={17} />
          </motion.button>
        )}
      </AnimatePresence>

      <motion.a
        href="https://wa.me/256772284451?text=Hello%20KIMUNA%2C%20I%27d%20like%20a%20quote."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with KIMUNA on WhatsApp — +256 772 284451"
        title="+256 772 284451"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.1, type: "spring", stiffness: 260, damping: 16 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="relative grid h-14 w-14 place-items-center rounded-full bg-blue text-white shadow-[0_18px_40px_-16px_rgba(30,90,168,0.95)] dark:bg-sky dark:text-[#06172e]"
      >
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-blue/40 dark:bg-sky/30" />
        <WhatsAppIcon className="h-7 w-7" />
      </motion.a>
    </div>
  );
}

function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

function Shell() {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar theme={theme} toggleTheme={toggle} />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Suspense
            fallback={
              <div className="grid min-h-screen place-items-center bg-surface">
                <div className="flex flex-col items-center gap-4">
                  <span className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-blue" />
                  <span className="spec-label text-soft">LOADING…</span>
                </div>
              </div>
            }
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/catalogue" element={<Catalogue />} />
              <Route path="/admin/*" element={<AdminApp />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
      {!isAdmin && <Footer />}
      {!isAdmin && <Fabs />}
    </>
  );
}

export default function App() {
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <ScrollReset />
        <Shell />
      </HashRouter>
    </MotionConfig>
  );
}
