import React from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import ConsultationBookingModal from "@/components/ConsultationBookingModal";
import { useSiteSettings } from "@/lib/siteSettingsContext";

export default function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled]         = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [modalOpen, setModalOpen]           = React.useState(false);
  const { websiteSettings } = useSiteSettings();
  const siteName = websiteSettings.site_name ?? "Modulyn Space";
  const logoUrl  = websiteSettings.company_logo_url ?? null;

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { label: "Home",          href: "/" },
    { label: "Projects",      href: "/projects" },
    { label: "Our Story",     href: "/story" },
    { label: "Modulyn Store", href: "/store" },
    { label: "Contact",       href: "/contact" },
  ];

  const isHomepage = location === "/";
  const navBg = isHomepage && !isScrolled
    ? "bg-transparent text-white border-transparent"
    : "bg-white/90 backdrop-blur-md text-foreground border-border/40 shadow-sm";

  const hamburgerColor = isHomepage && !isScrolled && !mobileMenuOpen
    ? "bg-white"
    : "bg-foreground";

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${navBg}`}>
        {/*
         * CSS Grid: max-content | 1fr | max-content
         *
         * max-content (left)  — brand cell is EXACTLY as wide as logo + wordmark.
         *                        It cannot grow into the center column.
         * 1fr         (center) — nav cell gets ALL remaining space.
         *                        Items are justify-content:center inside this cell.
         * max-content (right)  — CTA / hamburger cell is EXACTLY as wide as its content.
         *
         * Overlap is structurally impossible: each column boundary is enforced
         * by the browser's grid engine. No margins, no transforms, no absolute positioning.
         *
         * Works on both mobile and desktop:
         *   Mobile  — nav cell is empty (hidden); brand left, hamburger right.
         *   Desktop — all three columns visible and balanced.
         */}
        <div
          className="container mx-auto px-6 h-20 grid items-center"
          style={{ gridTemplateColumns: "max-content 1fr max-content" }}
        >
          {/* ── Col 1 (max-content): Brand ─────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-3"
            data-testid="link-home-logo"
          >
            {logoUrl && (
              <img
                src={logoUrl}
                alt={siteName}
                className="h-12 w-auto object-contain flex-none"
                style={{ height: "48px" }}
                draggable={false}
              />
            )}
            <span
              className="font-serif tracking-widest uppercase whitespace-nowrap"
              style={{ fontSize: "22px" }}
            >
              {siteName}
            </span>
          </Link>

          {/* ── Col 2 (1fr): Navigation — centered inside the 1fr cell ─── */}
          <nav
            className="hidden md:flex items-center justify-center gap-8"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={location === link.href ? "page" : undefined}
                className={`text-sm font-medium tracking-wide whitespace-nowrap transition-colors hover:text-primary ${
                  location === link.href ? "text-primary" : ""
                }`}
                data-testid={`link-nav-${link.label.toLowerCase().replace(" ", "-")}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── Col 3 (max-content): CTA (desktop) + Hamburger (mobile) ── */}
          <div className="flex items-center justify-end">
            {/* Desktop CTA */}
            <Button
              className="hidden md:inline-flex rounded-sm bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setModalOpen(true)}
              data-testid="link-nav-cta"
            >
              Book Consultation
            </Button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              data-testid="button-mobile-menu"
            >
              <span className={`block w-6 h-0.5 transition-transform duration-300 ${hamburgerColor} ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-6 h-0.5 transition-opacity duration-300 ${hamburgerColor} ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-6 h-0.5 transition-transform duration-300 ${hamburgerColor} ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── Mobile full-screen menu — unchanged ─────────────────────── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute top-0 left-0 right-0 h-screen bg-background flex flex-col justify-center items-center z-40 p-6"
            >
              <nav className="flex flex-col items-center gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={location === link.href ? "page" : undefined}
                    className={`text-2xl font-serif transition-colors hover:text-primary ${
                      location === link.href ? "text-primary" : "text-foreground"
                    }`}
                    data-testid={`link-mobile-nav-${link.label.toLowerCase().replace(" ", "-")}`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Button
                  size="lg"
                  className="rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 mt-4 w-full max-w-[200px]"
                  onClick={() => { setMobileMenuOpen(false); setModalOpen(true); }}
                  data-testid="link-mobile-nav-cta"
                >
                  Book Consultation
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <ConsultationBookingModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
