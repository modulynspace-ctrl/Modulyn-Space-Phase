import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import {
  fetchHomepageSettings,
  updateHomepageSettings,
  fetchWebsiteSettings,
  updateWebsiteSettings,
} from "@/lib/settingsApi";
import MediaPickerModal from "@/admin/media/MediaPickerModal";
import type { MediaItem } from "@/lib/mediaTypes";

type SaveState = "idle" | "saving" | "saved" | "error";

interface Project { id: string; title: string }

// ── Shared Save Button ─────────────────────────────────────────────────────────

function SaveButton({
  state, errorMsg, onClick,
}: { state: SaveState; errorMsg: string; onClick: () => void }) {
  return (
    <div className="pt-6 border-t border-border space-y-3">
      {state === "error" && errorMsg && (
        <div className="flex items-start gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded p-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
      {state === "saved" && (
        <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded p-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Settings saved. Reload the public site to see changes.</span>
        </div>
      )}
      <Button
        onClick={onClick}
        disabled={state === "saving"}
        className="bg-primary hover:bg-primary/90 h-11 px-8"
      >
        {state === "saving" ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving…
          </span>
        ) : "Save Settings"}
      </Button>
    </div>
  );
}

// ── Homepage Settings Tab ─────────────────────────────────────────────────────

interface HsForm {
  hero_headline:        string;
  hero_subheading:      string;
  hero_image_url:       string | null;
  featured_project_id:  string | null;
  stats_projects_count: number;
  stats_clients_count:  number;
  stats_years:          number;
}

const HS_DEFAULT: HsForm = {
  hero_headline:        "",
  hero_subheading:      "",
  hero_image_url:       null,
  featured_project_id:  null,
  stats_projects_count: 200,
  stats_clients_count:  150,
  stats_years:          1,
};

function HomepageSettingsTab() {
  const [form,        setForm]        = useState<HsForm>(HS_DEFAULT);
  const [projects,    setProjects]    = useState<Project[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saveState,   setSaveState]   = useState<SaveState>("idle");
  const [errorMsg,    setErrorMsg]    = useState("");
  const [mediaOpen,   setMediaOpen]   = useState(false);

  useEffect(() => {
    async function init() {
      setLoadingData(true);
      const [hs, ps] = await Promise.all([
        fetchHomepageSettings(),
        supabase.from("projects").select("id, title").order("title"),
      ]);
      if (hs.data) {
        setForm({
          hero_headline:        hs.data.hero_headline        ?? "",
          hero_subheading:      hs.data.hero_subheading      ?? "",
          hero_image_url:       hs.data.hero_image_url       ?? null,
          featured_project_id:  hs.data.featured_project_id  ?? null,
          stats_projects_count: hs.data.stats_projects_count ?? 200,
          stats_clients_count:  hs.data.stats_clients_count  ?? 150,
          stats_years:          hs.data.stats_years          ?? 1,
        });
      }
      setProjects((ps.data ?? []) as Project[]);
      setLoadingData(false);
    }
    init();
  }, []);

  function patch<K extends keyof HsForm>(key: K, value: HsForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (saveState === "saved") setSaveState("idle");
  }

  async function handleSave() {
    setSaveState("saving");
    setErrorMsg("");
    const { error } = await updateHomepageSettings({
      hero_headline:        form.hero_headline        || null,
      hero_subheading:      form.hero_subheading      || null,
      hero_image_url:       form.hero_image_url,
      featured_project_id:  form.featured_project_id,
      stats_projects_count: form.stats_projects_count,
      stats_clients_count:  form.stats_clients_count,
      stats_years:          form.stats_years,
    });
    if (error) { setErrorMsg(error); setSaveState("error"); }
    else        { setSaveState("saved"); }
  }

  function handleMediaSelect(item: MediaItem) {
    patch("hero_image_url", item.url);
    setMediaOpen(false);
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Hero Headline */}
      <div className="space-y-2">
        <Label>Hero Headline</Label>
        <Input
          value={form.hero_headline}
          onChange={(e) => patch("hero_headline", e.target.value)}
          placeholder="Designing Spaces That Feel Like Home. Crafted To Last."
        />
        <p className="text-xs text-muted-foreground">Main heading shown on the homepage hero.</p>
      </div>

      {/* Hero Subtitle */}
      <div className="space-y-2">
        <Label>Hero Subtitle</Label>
        <Textarea
          value={form.hero_subheading}
          onChange={(e) => patch("hero_subheading", e.target.value)}
          placeholder="Bespoke residential and commercial interiors in Karnataka…"
          rows={3}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">Subheading below the hero title.</p>
      </div>

      {/* Hero Background Image */}
      <div className="space-y-3">
        <Label>Hero Background Image</Label>
        {form.hero_image_url ? (
          <div className="relative group w-full max-w-sm">
            <img
              src={form.hero_image_url}
              alt="Hero background"
              className="w-full h-40 object-cover rounded border border-border"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => setMediaOpen(true)}>Change</Button>
              <Button size="sm" variant="destructive" onClick={() => patch("hero_image_url", null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="gap-2" onClick={() => setMediaOpen(true)}>
            <ImageIcon className="w-4 h-4" />
            Pick from Media Library
          </Button>
        )}
        <p className="text-xs text-muted-foreground">Leave empty to use the default hero image.</p>
      </div>

      {/* Featured Project */}
      <div className="space-y-2">
        <Label>Featured Project</Label>
        <Select
          value={form.featured_project_id ?? "__auto__"}
          onValueChange={(val) => patch("featured_project_id", val === "__auto__" ? null : val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Auto-select (featured flag)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__auto__">Auto-select (use featured flag)</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Override which project appears in the homepage featured section.</p>
      </div>

      {/* Statistics */}
      <div className="space-y-3">
        <Label>Statistics</Label>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-muted-foreground">Projects Completed</Label>
            <Input
              type="number"
              min={0}
              value={form.stats_projects_count}
              onChange={(e) => patch("stats_projects_count", Math.max(0, Number(e.target.value)))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-muted-foreground">Happy Clients</Label>
            <Input
              type="number"
              min={0}
              value={form.stats_clients_count}
              onChange={(e) => patch("stats_clients_count", Math.max(0, Number(e.target.value)))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-muted-foreground">Years Experience</Label>
            <Input
              type="number"
              min={0}
              value={form.stats_years}
              onChange={(e) => patch("stats_years", Math.max(0, Number(e.target.value)))}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Displayed in the homepage hero trust bar.</p>
      </div>

      <SaveButton state={saveState} errorMsg={errorMsg} onClick={handleSave} />

      <MediaPickerModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}

// ── Website Settings Tab ───────────────────────────────────────────────────────

type WsForm = Record<string, string>;

const WS_KEYS: string[] = [
  "site_name", "site_phone", "site_email", "site_address",
  "google_maps_url", "whatsapp_number",
  "instagram_url", "facebook_url", "linkedin_url", "youtube_url",
  "copyright_text", "footer_text",
];

function buildDefault(): WsForm {
  return Object.fromEntries(WS_KEYS.map((k) => [k, ""]));
}

function WebsiteSettingsTab() {
  const [form,        setForm]        = useState<WsForm>(buildDefault);
  const [loadingData, setLoadingData] = useState(true);
  const [saveState,   setSaveState]   = useState<SaveState>("idle");
  const [errorMsg,    setErrorMsg]    = useState("");

  useEffect(() => {
    fetchWebsiteSettings().then(({ data }) => {
      setForm((prev) => {
        const merged = { ...prev };
        for (const key of WS_KEYS) {
          merged[key] = data[key as keyof typeof data] ?? "";
        }
        return merged;
      });
      setLoadingData(false);
    });
  }, []);

  function patch(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (saveState === "saved") setSaveState("idle");
  }

  async function handleSave() {
    setSaveState("saving");
    setErrorMsg("");
    const updates: Record<string, string | null> = {};
    for (const [key, value] of Object.entries(form)) {
      updates[key] = value.trim() || null;
    }
    const { error } = await updateWebsiteSettings(updates);
    if (error) { setErrorMsg(error); setSaveState("error"); }
    else        { setSaveState("saved"); }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Name */}
        <div className="space-y-2">
          <Label>Company Name</Label>
          <Input
            value={form.site_name}
            onChange={(e) => patch("site_name", e.target.value)}
            placeholder="Modulyn Space"
          />
          <p className="text-xs text-muted-foreground">Shown in Navbar, Footer, and page titles.</p>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input
            value={form.site_phone}
            onChange={(e) => patch("site_phone", e.target.value)}
            placeholder="+91 98765 43210"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input
            type="email"
            value={form.site_email}
            onChange={(e) => patch("site_email", e.target.value)}
            placeholder="hello@modulynspace.com"
          />
        </div>

        {/* WhatsApp */}
        <div className="space-y-2">
          <Label>WhatsApp Number</Label>
          <Input
            value={form.whatsapp_number}
            onChange={(e) => patch("whatsapp_number", e.target.value)}
            placeholder="919876543210"
          />
          <p className="text-xs text-muted-foreground">Digits only with country code (e.g. 919876543210).</p>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label>Studio Address</Label>
        <Textarea
          value={form.site_address}
          onChange={(e) => patch("site_address", e.target.value)}
          placeholder="123 Design Avenue, Bengaluru 560001"
          rows={2}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">Shown in Footer and Contact page.</p>
      </div>

      {/* Google Maps */}
      <div className="space-y-2">
        <Label>Google Maps Embed URL</Label>
        <Input
          value={form.google_maps_url}
          onChange={(e) => patch("google_maps_url", e.target.value)}
          placeholder="https://www.google.com/maps/embed?pb=…"
        />
        <p className="text-xs text-muted-foreground">
          Google Maps → Share → Embed a map → copy the <code className="text-xs bg-muted px-1 rounded">src</code> URL. Replaces the placeholder map on the Contact page.
        </p>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <Label>Social Media Links</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-muted-foreground">Instagram URL</Label>
            <Input
              value={form.instagram_url}
              onChange={(e) => patch("instagram_url", e.target.value)}
              placeholder="https://instagram.com/modulynspace"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-muted-foreground">Facebook URL</Label>
            <Input
              value={form.facebook_url}
              onChange={(e) => patch("facebook_url", e.target.value)}
              placeholder="https://facebook.com/modulynspace"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-muted-foreground">LinkedIn URL</Label>
            <Input
              value={form.linkedin_url}
              onChange={(e) => patch("linkedin_url", e.target.value)}
              placeholder="https://linkedin.com/company/modulynspace"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-muted-foreground">YouTube URL</Label>
            <Input
              value={form.youtube_url}
              onChange={(e) => patch("youtube_url", e.target.value)}
              placeholder="https://youtube.com/@modulynspace"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Only links with a URL will appear as icons in the Footer.</p>
      </div>

      {/* Copyright */}
      <div className="space-y-2">
        <Label>Copyright Text</Label>
        <Input
          value={form.copyright_text}
          onChange={(e) => patch("copyright_text", e.target.value)}
          placeholder={`© ${new Date().getFullYear()} Modulyn Space. All rights reserved.`}
        />
        <p className="text-xs text-muted-foreground">Shown at the bottom of the Footer. Leave empty to auto-generate.</p>
      </div>

      {/* Footer Tagline */}
      <div className="space-y-2">
        <Label>Footer Tagline</Label>
        <Textarea
          value={form.footer_text}
          onChange={(e) => patch("footer_text", e.target.value)}
          placeholder="Crafting bespoke residential and commercial spaces…"
          rows={2}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">Short description shown under the company name in the Footer.</p>
      </div>

      <SaveButton state={saveState} errorMsg={errorMsg} onClick={handleSave} />
    </div>
  );
}

// ── Main AdminSettings Page ────────────────────────────────────────────────────

export default function AdminSettings() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-medium text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage homepage content and global site configuration.</p>
      </div>

      <Tabs defaultValue="homepage" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="homepage">Homepage Settings</TabsTrigger>
          <TabsTrigger value="website">Website Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="homepage">
          <div className="bg-white border border-border rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-serif font-medium mb-1">Homepage Settings</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Edit the hero content, featured project, and statistics. Changes reflect on the public homepage after saving and reloading.
            </p>
            <HomepageSettingsTab />
          </div>
        </TabsContent>

        <TabsContent value="website">
          <div className="bg-white border border-border rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-serif font-medium mb-1">Website Settings</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Edit contact info, social links, and footer content. Changes reflect in the Navbar, Footer, and Contact page after saving and reloading.
            </p>
            <WebsiteSettingsTab />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
