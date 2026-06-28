import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus, Pencil, Trash2, Loader2, AlertCircle, RefreshCw,
  Search, ChevronLeft, ChevronRight, ArrowLeft, Star,
  Upload, X, Library, ImageOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Testimonial, TestimonialPayload,
  fetchAdminTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
} from "@/lib/testimonialsApi";
import { supabase } from "@/lib/supabase";
import { MediaItem, isAllowedFile } from "@/lib/mediaTypes";
import { uploadMedia } from "@/lib/mediaApi";
import MediaPickerModal from "@/admin/media/MediaPickerModal";

const PAGE_SIZE = 20;

interface ProjectOption { id: string; title: string; }

// ── Star Rating ───────────────────────────────────────────────────────────────

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button type="button" key={n} onClick={() => onChange(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          className="text-amber-400 transition-transform hover:scale-110">
          <Star className={`w-6 h-6 ${n <= (hover || value) ? "fill-amber-400" : "fill-none"}`} />
        </button>
      ))}
      <span className="text-sm text-muted-foreground ml-2 self-center">{value}/5</span>
    </div>
  );
}

// ── List ──────────────────────────────────────────────────────────────────────

interface ListProps {
  items: Testimonial[]; loading: boolean; error: string | null;
  onAdd: () => void; onEdit: (t: Testimonial) => void;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string, field: "active" | "featured", val: boolean) => Promise<void>;
  onRefresh: () => void;
}

function TestimonialList({ items, loading, error, onAdd, onEdit, onDelete, onToggle, onRefresh }: ListProps) {
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);
  const [delTarget, setDel]     = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? items.filter(i => i.client_name.toLowerCase().includes(q) || (i.client_location ?? "").toLowerCase().includes(q)) : items;
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function confirmDelete() {
    if (!delTarget) return;
    setDeleting(true);
    await onDelete(delTarget.id);
    setDeleting(false); setDel(null);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif font-medium mb-1">Testimonials</h1>
          <p className="text-sm text-muted-foreground">{loading ? "Loading…" : `${items.length} testimonial${items.length !== 1 ? "s" : ""}`}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={onAdd} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Add Testimonial
          </Button>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl px-5 py-4 flex gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by client name or location…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9 border-border/60" />
        </div>
      </div>

      {loading && <div className="flex justify-center min-h-48 items-center"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>}
      {!loading && error && (
        <div className="bg-white border border-border rounded-xl flex flex-col items-center justify-center min-h-48 gap-4 p-8 text-center">
          <AlertCircle className="w-7 h-7 text-destructive" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={onRefresh}>Try again</Button>
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <div className="bg-white border border-border rounded-xl py-20 text-center">
          <p className="text-sm text-muted-foreground mb-4">No testimonials yet.</p>
          <Button onClick={onAdd} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="w-4 h-4" /> Add Testimonial</Button>
        </div>
      )}
      {!loading && !error && paged.length > 0 && (
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-12">Photo</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Review</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground w-24">Rating</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground w-24">Featured</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground w-24">Active</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.map(t => (
                <tr key={t.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary border border-border">
                      {t.avatar_url
                        ? <img src={t.avatar_url} alt={t.client_name} loading="lazy" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-xs">{t.client_name[0]}</div>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{t.client_name}</p>
                    {t.client_location && <p className="text-xs text-muted-foreground mt-0.5">{t.client_location}</p>}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-sm text-muted-foreground line-clamp-2 italic">"{t.content}"</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-0.5">
                      {[1,2,3,4,5].map(n => <Star key={n} className={`w-3.5 h-3.5 ${n <= t.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={async () => { setToggling(`${t.id}-f`); await onToggle(t.id, "featured", !t.featured); setToggling(null); }} disabled={toggling === `${t.id}-f`} className="mx-auto block">
                      {toggling === `${t.id}-f`
                        ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        : <Star className={`w-4 h-4 mx-auto ${t.featured ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={async () => { setToggling(`${t.id}-a`); await onToggle(t.id, "active", !t.active); setToggling(null); }} disabled={toggling === `${t.id}-a`} className="mx-auto block">
                      {toggling === `${t.id}-a`
                        ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        : <div className={`w-9 h-5 rounded-full relative ${t.active ? "bg-emerald-500" : "bg-border"}`}>
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${t.active ? "translate-x-4" : "translate-x-0.5"}`} />
                          </div>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(t)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDel(t)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <Button key={n} variant={page === n ? "default" : "outline"} size="sm" className={`h-7 w-7 p-0 text-xs ${page === n ? "bg-primary text-primary-foreground" : ""}`} onClick={() => setPage(n)}>{n}</Button>
            ))}
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!delTarget} onOpenChange={v => { if (!v && !deleting) setDel(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete testimonial by "{delTarget?.client_name}"?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="w-4 h-4 animate-spin mr-2 inline" />Deleting…</> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Form ──────────────────────────────────────────────────────────────────────

interface FormProps {
  item?: Testimonial;
  onSave: (p: TestimonialPayload) => Promise<{ error: string | null }>;
  onCancel: () => void;
}

function TestimonialForm({ item, onSave, onCancel }: FormProps) {
  const isEdit = !!item;
  const [clientName,     setClientName]     = useState(item?.client_name     ?? "");
  const [clientLocation, setClientLocation] = useState(item?.client_location ?? "");
  const [projectId,      setProjectId]      = useState(item?.project_id      ?? "");
  const [rating,         setRating]         = useState(item?.rating          ?? 5);
  const [content,        setContent]        = useState(item?.content         ?? "");
  const [avatarUrl,      setAvatarUrl]      = useState(item?.avatar_url      ?? "");
  const [featured,       setFeatured]       = useState(item?.featured        ?? false);
  const [active,         setActive]         = useState(item?.active          ?? true);
  const [sortOrder,      setSortOrder]      = useState(item?.sort_order.toString() ?? "0");

  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgErr, setImgErr] = useState<string | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState<string | null>(null);

  useEffect(() => {
    supabase.from("projects").select("id, title").in("status", ["in_progress", "completed"]).order("title").then(({ data }) => {
      if (data) setProjects(data as ProjectOption[]);
    });
  }, []);

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (uploadRef.current) uploadRef.current.value = "";
    if (!isAllowedFile(file)) { setImgErr("Use JPG, PNG, WEBP, or AVIF."); return; }
    setImgUploading(true); setImgErr(null);
    const { data, error: ue } = await uploadMedia(file, "team");
    setImgUploading(false);
    if (ue) { setImgErr(ue); return; }
    if (data) setAvatarUrl(data.url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName.trim()) { setErr("Client name is required."); return; }
    if (!content.trim())    { setErr("Review content is required."); return; }
    setSaving(true);
    const result = await onSave({
      client_name: clientName.trim(), client_location: clientLocation.trim() || null,
      project_id: projectId || null, rating, content: content.trim(),
      avatar_url: avatarUrl || null, featured, active,
      sort_order: parseInt(sortOrder, 10) || 0,
    });
    setSaving(false);
    if (result.error) setErr(result.error);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="gap-2" onClick={onCancel}><ArrowLeft className="w-4 h-4" /> Back</Button>
        <h1 className="text-3xl font-serif font-medium">{isEdit ? "Edit Testimonial" : "New Testimonial"}</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-6">
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label>Client Name <span className="text-destructive">*</span></Label>
                  <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Priya S." className="border-border/60" />
                </div>
                <div className="space-y-1.5">
                  <Label>Location</Label>
                  <Input value={clientLocation} onChange={e => setClientLocation(e.target.value)} placeholder="e.g. Whitefield" className="border-border/60" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Linked Project <span className="text-xs text-muted-foreground font-normal ml-1">Optional</span></Label>
                <Select value={projectId || "_none"} onValueChange={v => setProjectId(v === "_none" ? "" : v)}>
                  <SelectTrigger className="border-border/60"><SelectValue placeholder="Select a project…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">None</SelectItem>
                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <StarRating value={rating} onChange={setRating} />
              </div>
              <div className="space-y-1.5">
                <Label>Review <span className="text-destructive">*</span></Label>
                <Textarea value={content} onChange={e => setContent(e.target.value)} rows={5} placeholder="What the client said…" className="border-border/60 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-5 pt-2 border-t border-border/50">
                <div className="space-y-1.5">
                  <Label>Sort Order</Label>
                  <Input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} min="0" className="border-border/60" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Client Photo</h2>
              <div className="aspect-square rounded-full overflow-hidden border border-border bg-secondary relative mx-auto w-32 h-32">
                {avatarUrl
                  ? <><img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setAvatarUrl("")} className="absolute top-1 right-1 p-1 bg-black/40 rounded-full hover:bg-destructive/70 text-white"><X className="w-3 h-3" /></button></>
                  : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageOff className="w-6 h-6" /></div>}
                {imgUploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full"><Loader2 className="w-5 h-5 animate-spin text-white" /></div>}
              </div>
              {imgErr && <p className="text-xs text-destructive text-center">{imgErr}</p>}
              <div className="flex flex-col gap-2">
                <Button type="button" variant="outline" size="sm" className="w-full gap-2 justify-center" onClick={() => setPickerOpen(true)}><Library className="w-4 h-4" /> Choose from Library</Button>
                <Button type="button" variant="outline" size="sm" className="w-full gap-2 justify-center" onClick={() => uploadRef.current?.click()} disabled={imgUploading}>
                  {imgUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Upload className="w-4 h-4" /> Upload Photo</>}
                </Button>
                {avatarUrl && <button type="button" onClick={() => setAvatarUrl("")} className="text-xs text-destructive hover:underline text-center">Remove photo</button>}
              </div>
              <input ref={uploadRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={handleImageFile} />
            </div>

            <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Visibility</h2>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Active</p><p className="text-xs text-muted-foreground">Show on website</p></div>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Featured</p><p className="text-xs text-muted-foreground">Highlighted on homepage</p></div>
                <Switch checked={featured} onCheckedChange={setFeatured} />
              </div>
            </div>
          </div>
        </div>

        {err && <div className="flex items-start gap-2 text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg mt-6"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {err}</div>}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-28">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{isEdit ? "Saving…" : "Creating…"}</> : isEdit ? "Save Changes" : "Create Testimonial"}
          </Button>
        </div>
      </form>

      <MediaPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(item: MediaItem) => setAvatarUrl(item.url)} defaultBucket="team" title="Choose Client Photo" />
    </div>
  );
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

type Mode = "list" | "new" | "edit";

export default function AdminTestimonials() {
  const [mode,     setMode]     = useState<Mode>("list");
  const [editItem, setEditItem] = useState<Testimonial | null>(null);
  const [items,    setItems]    = useState<Testimonial[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error: err } = await fetchAdminTestimonials();
    setLoading(false); setError(err);
    if (!err) setItems(data);
  }

  async function handleSave(payload: TestimonialPayload) {
    if (editItem) {
      const r = await updateTestimonial(editItem.id, payload);
      if (!r.error) { setItems(p => p.map(i => i.id === editItem.id ? { ...editItem, ...payload, updated_at: new Date().toISOString() } : i)); setMode("list"); setEditItem(null); }
      return r;
    }
    const { data, error: err } = await createTestimonial(payload);
    if (!err && data) { setItems(p => [data, ...p]); setMode("list"); }
    return { error: err };
  }

  if (mode !== "list") {
    return <TestimonialForm item={mode === "edit" ? (editItem ?? undefined) : undefined} onSave={handleSave} onCancel={() => { setMode("list"); setEditItem(null); }} />;
  }
  return (
    <TestimonialList items={items} loading={loading} error={error} onAdd={() => setMode("new")}
      onEdit={t => { setEditItem(t); setMode("edit"); }}
      onDelete={async id => { const { error: e } = await deleteTestimonial(id); if (!e) setItems(p => p.filter(i => i.id !== id)); }}
      onToggle={async (id, field, val) => {
        const { error: e } = await updateTestimonial(id, { [field]: val });
        if (!e) setItems(p => p.map(i => i.id === id ? { ...i, [field]: val } : i));
      }}
      onRefresh={load}
    />
  );
}
