import React from "react";
import { Link } from "wouter";
import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import { useSiteSettings } from "@/lib/siteSettingsContext";

export default function Footer() {
  const { websiteSettings } = useSiteSettings();

  const siteName   = websiteSettings.site_name    ?? "Modulyn Space";
  const phone      = websiteSettings.site_phone   ?? "+91 98765 43210";
  const email      = websiteSettings.site_email   ?? "hello@modulynspace.com";
  const address    = websiteSettings.site_address ?? "123 Design Avenue, Bengaluru 560001";
  const instagram  = websiteSettings.instagram_url ?? null;
  const facebook   = websiteSettings.facebook_url  ?? null;
  const linkedin   = websiteSettings.linkedin_url  ?? null;
  const youtube    = websiteSettings.youtube_url   ?? null;
  const copyright  = websiteSettings.copyright_text ?? `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`;
  const footerText = websiteSettings.footer_text   ?? "Crafting bespoke residential and commercial spaces with transparency, craftsmanship, and timeless quality in Karnataka, India.";

  const hasSocialLinks = instagram || facebook || linkedin || youtube;

  return (
    <footer className="bg-foreground text-background py-16 md:py-24 border-t border-border/10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="space-y-6">
          <Link href="/" className="font-serif text-2xl tracking-widest uppercase block" data-testid="link-footer-home">
            {siteName}
          </Link>
          <p className="text-muted-foreground text-sm max-w-sm">
            {footerText}
          </p>
          <div className="flex items-center gap-4">
            {hasSocialLinks ? (
              <>
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                    <Instagram size={20} />
                  </a>
                )}
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors">
                    <Facebook size={20} />
                  </a>
                )}
                {linkedin && (
                  <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
                    <Linkedin size={20} />
                  </a>
                )}
                {youtube && (
                  <a href={youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-muted-foreground hover:text-primary transition-colors">
                    <Youtube size={20} />
                  </a>
                )}
              </>
            ) : (
              <>
                <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin size={20} />
                </a>
              </>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <h3 className="font-serif text-lg tracking-wide">Quick Links</h3>
          <ul className="space-y-3">
            {['Projects', 'Our Story', 'Modulyn Store', 'Contact'].map((item) => (
              <li key={item}>
                <Link
                  href={`/${item.toLowerCase().replace(' ', '')}`}
                  className="text-muted-foreground text-sm hover:text-primary transition-colors"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div className="space-y-6">
          <h3 className="font-serif text-lg tracking-wide">Services</h3>
          <ul className="space-y-3">
            {['Home Interiors', 'Modular Kitchens', 'Turnkey Projects', 'Commercial Spaces'].map((item) => (
              <li key={item} className="text-muted-foreground text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-6">
          <h3 className="font-serif text-lg tracking-wide">Contact Us</h3>
          <address className="not-italic space-y-3 text-sm text-muted-foreground">
            <p>{address}</p>
            <p className="pt-2">
              <a href={`mailto:${email}`} className="hover:text-primary transition-colors">{email}</a>
            </p>
            <p>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-primary transition-colors">{phone}</a>
            </p>
          </address>
        </div>
      </div>
      <div className="container mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <p>{copyright}</p>
        <div className="flex gap-4">
          <Link href="#" className="hover:text-primary">Privacy Policy</Link>
          <Link href="#" className="hover:text-primary">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
