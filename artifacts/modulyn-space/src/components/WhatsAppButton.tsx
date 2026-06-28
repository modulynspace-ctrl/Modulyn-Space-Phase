import React from "react";
import { useSiteSettings } from "@/lib/siteSettingsContext";

export default function WhatsAppButton() {
  const { websiteSettings } = useSiteSettings();
  const number = websiteSettings.whatsapp_number;

  if (!number) return null;

  const message = encodeURIComponent("Hello! I'm interested in your interior design services.");
  const href = `https://wa.me/${number}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl hover:bg-[#1ebe5e] hover:scale-110 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-7 h-7"
        aria-hidden="true"
      >
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.123 1.522 5.857L.054 24l6.305-1.655A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm5.894 16.494c-.252.708-1.47 1.352-2.008 1.438-.514.082-1.16.116-1.87-.118-.432-.136-.987-.319-1.694-.625-2.976-1.287-4.92-4.29-5.066-4.488-.149-.2-1.214-1.613-1.214-3.075s.769-2.18 1.04-2.477c.272-.298.595-.372.793-.372.199 0 .397.002.57.01.183.01.428-.07.67.51.248.594.842 2.058.916 2.207.075.149.124.322.025.52-.1.199-.149.323-.298.497-.149.174-.313.387-.447.52-.149.149-.304.31-.13.607.173.297.77 1.27 1.653 2.059 1.135 1.012 2.093 1.325 2.39 1.475.297.148.471.124.644-.075.173-.198.743-.867.94-1.164.198-.298.396-.249.67-.15.272.1 1.732.818 2.029.967.297.149.496.223.57.347.074.125.074.719-.178 1.427z" />
      </svg>
    </a>
  );
}
