import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  fetchHomepageSettings,
  fetchWebsiteSettings,
  HomepageSettings,
  WebsiteSettings,
} from "@/lib/settingsApi";

interface SiteSettingsValue {
  homepageSettings: HomepageSettings | null;
  websiteSettings:  WebsiteSettings;
  loading:          boolean;
  refresh:          () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsValue>({
  homepageSettings: null,
  websiteSettings:  {},
  loading:          true,
  refresh:          async () => {},
});

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings | null>(null);
  const [websiteSettings,  setWebsiteSettings]  = useState<WebsiteSettings>({});
  const [loading,          setLoading]          = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [hs, ws] = await Promise.all([fetchHomepageSettings(), fetchWebsiteSettings()]);
    setHomepageSettings(hs.data);
    setWebsiteSettings(ws.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <SiteSettingsContext.Provider value={{ homepageSettings, websiteSettings, loading, refresh: load }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
