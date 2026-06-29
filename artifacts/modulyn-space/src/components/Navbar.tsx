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
        <div className="container mx-auto px-6 h-20">

          {/*
           * Desktop: CSS grid with [1fr  auto  1fr]
           *   col-1 (1fr)  → brand, left-aligned
           *   col-2 (auto) → nav links, naturally centered
           *   col-3 (1fr)  → CTA button, right-aligned
           * Because col-1 and col-3 each hold exactly 1fr of the leftover space,
           * col-2 is always perfectly centered — no matter how wide the logo+name is.
           *
           * Mobile: simple flex justify-between (nav/CTA hidden, hamburger shown).
           */}
          <div className="h-full flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]">

            {/* ── Col 1: Brand (logo + name) ───────────────────────────── */}
            <Link
              href="/"
              className="flex items-center gap-3 min-w-0 shrink-0 md:shrink md:justify-self-start"
              data-testid="link-home-logo"
            >
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt={siteName}
                  className="h-8 sm:h-10 md:h-12 w-auto object-contain shrink-0"
                  draggable={false}
                />
              )}
              <span className="font-serif text-lg md:text-xl tracking-widest uppercase whitespace-nowrap">
                {siteName}
              </span>
            </Link>

            {/* ── Col 2: Nav links (desktop only, truly centered) ─────── */}
            <nav
              className="hidden md:flex items-center gap-7 justify-self-center"
              aria-label="Main navigation"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={location === link.href ? "page" : undefined}
                  className={`text-sm font-medium tracking-wide transition-colors hover:text-primary whitespace-nowrap ${
                    location === link.href ? "text-primary" : ""
                  }`}
                  data-testid={`link-nav-${link.label.toLowerCase().replace(" ", "-")}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* ── Col 3: CTA (desktop) + Hamburger (mobile) ───────────── */}
            <div className="flex items-center justify-end shrink-0 md:justify-self-end">
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
        </div>

        {/* ── Mobile full-screen menu (unchanged) ─────────────────────── */}
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
