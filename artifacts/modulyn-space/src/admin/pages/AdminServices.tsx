import React, { useEffect, useMemo, useState } from "react";
import {
  Plus, Pencil, Trash2, Loader2, AlertCircle, RefreshCw,
  Search, ChevronLeft, ChevronRight, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Service, ServicePayload,
  fetchAdminServices, createService, updateService, deleteService,
} from "@/lib/servicesApi";

const PAGE_SIZE = 20;
function slugify(s: string) { return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

// ── List ──────────────────────────────────────────────────────────────────────

interface ListProps {
  items: Service[]; loading: boolean; error: string | null;
  onAdd: () => void; onEdit: (s: Service) => void;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string, val: boolean) => Promise<void>;
  onRefresh: () => void;
}

function ServiceList({ items, loading, error, onAdd, onEdit, onDelete, onToggle, onRefresh }: ListProps) {
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);
  const [delTarget, setDel]     = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? items.filter(i => i.title.toLowerCase().includes(q)) : items;
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function confirmDelete() {
    if (!delTarget) return;
    setDeleting(true);
    await onDelete(delTarget.id);
    setDeleting(false);
    setDel(null);
  }

  async function handleToggle(id: string, val: boolean) {
    setToggling(id);
    await onToggle(id, val);
    setToggling(null);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif font-medium mb-1">Services</h1>
          <p className="text-sm text-muted-foreground">{loading ? "Loading…" : `${items.length} service${items.length !== 1 ? "s" : ""}`}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={onAdd} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Add Service
          </Button>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl px-5 py-4 flex gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search services…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9 border-border/60" />
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
          <p className="text-sm text-muted-foreground mb-4">No services yet.</p>
          <Button onClick={onAdd} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="w-4 h-4" /> Add Service</Button>
        </div>
      )}
      {!loading && !error && paged.length > 0 && (
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Service</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Short Description</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground w-16">Icon</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground w-20">Sort</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground w-24">Active</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.map(svc => (
                <tr key={svc.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{svc.title}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{svc.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs"><p className="truncate">{svc.short_description ?? "—"}</p></td>
                  <td className="px-4 py-3 text-center text-xl">{svc.icon ?? "—"}</td>
                  <td className="px-4 py-3 text-center text-sm text-muted-foreground">{svc.sort_order}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleToggle(svc.id, !svc.active)} disabled={toggling === svc.id} className="mx-auto block">
                      {toggling === svc.id
                        ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        : <div className={`w-9 h-5 rounded-full relative ${svc.active ? "bg-emerald-500" : "bg-border"}`}>
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${svc.active ? "translate-x-4" : "translate-x-0.5"}`} />
                          </div>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(svc)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDel(svc)}><Trash2 className="w-3.5 h-3.5" /></Button>
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
            <AlertDialogTitle>Delete "{delTarget?.title}"?</AlertDialogTitle>
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
  item?: Service;
  onSave: (p: ServicePayload) => Promise<{ error: string | null }>;
  onCancel: () => void;
}

function ServiceForm({ item, onSave, onCancel }: FormProps) {
  const isEdit = !!item;
  const [title,  setTitle]  = useState(item?.title ?? "");
  const [slug,   setSlug]   = useState(item?.slug ?? "");
  const [slugEd, setSlugEd] = useState(isEdit);
  const [short,  setShort]  = useState(item?.short_description ?? "");
  const [desc,   setDesc]   = useState(item?.description ?? "");
  const [icon,   setIcon]   = useState(item?.icon ?? "");
  const [sort,   setSort]   = useState(item?.sort_order.toString() ?? "0");
  const [active, setActive] = useState(item?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setErr("Title is required."); return; }
    if (!slug.trim())  { setErr("Slug is required.");  return; }
    setSaving(true);
    const result = await onSave({ title: title.trim(), slug: slug.trim(), short_description: short.trim() || null, description: desc.trim() || null, icon: icon.trim() || null, sort_order: parseInt(sort, 10) || 0, active });
    setSaving(false);
    if (result.error) setErr(result.error);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="gap-2" onClick={onCancel}><ArrowLeft className="w-4 h-4" /> Back</Button>
        <h1 className="text-3xl font-serif font-medium">{isEdit ? "Edit Service" : "New Service"}</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-5">
          <div className="space-y-1.5">
            <Label>Title <span className="text-destructive">*</span></Label>
            <Input value={title} onChange={e => { setTitle(e.target.value); if (!slugEd) setSlug(slugify(e.target.value)); }} placeholder="e.g. Modular Kitchen" className="border-border/60" />
          </div>
          <div className="space-y-1.5">
            <Label>Slug <span className="text-destructive">*</span> <span className="text-xs text-muted-foreground font-normal ml-1">Auto-generated</span></Label>
            <Input value={slug} onChange={e => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); setSlugEd(true); }} className="border-border/60 font-mono text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label>Short Description</Label>
            <Input value={short} onChange={e => setShort(e.target.value)} placeholder="One-line description shown on cards" className="border-border/60" />
          </div>
          <div className="space-y-1.5">
            <Label>Full Description</Label>
            <Textarea value={desc} onChange={e => setDesc(e.target.value)} rows={5} placeholder="Detailed description…" className="border-border/60 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label>Icon <span className="text-xs text-muted-foreground font-normal ml-1">Emoji or icon name</span></Label>
              <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="🏠 or kitchen" className="border-border/60" />
            </div>
            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input type="number" value={sort} onChange={e => setSort(e.target.value)} min="0" className="border-border/60" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div><p className="text-sm font-medium">Active</p><p className="text-xs text-muted-foreground">Visible on the public website</p></div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </div>
        {err && <div className="flex items-start gap-2 text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {err}</div>}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-28">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{isEdit ? "Saving…" : "Creating…"}</> : isEdit ? "Save Changes" : "Create Service"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

type Mode = "list" | "new" | "edit";

export default function AdminServices() {
  const [mode,     setMode]     = useState<Mode>("list");
  const [editItem, setEditItem] = useState<Service | null>(null);
  const [items,    setItems]    = useState<Service[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error: err } = await fetchAdminServices();
    setLoading(false); setError(err);
    if (!err) setItems(data);
  }

  async function handleSave(payload: ServicePayload) {
    if (editItem) {
      const r = await updateService(editItem.id, payload);
      if (!r.error) { setItems(p => p.map(i => i.id === editItem.id ? { ...editItem, ...payload, updated_at: new Date().toISOString() } : i)); setMode("list"); setEditItem(null); }
      return r;
    }
    const { data, error: err } = await createService(payload);
    if (!err && data) { setItems(p => [data, ...p]); setMode("list"); }
    return { error: err };
  }

  if (mode !== "list") {
    return <ServiceForm item={mode === "edit" ? (editItem ?? undefined) : undefined} onSave={handleSave} onCancel={() => { setMode("list"); setEditItem(null); }} />;
  }
  return (
    <ServiceList items={items} loading={loading} error={error} onAdd={() => setMode("new")}
      onEdit={s => { setEditItem(s); setMode("edit"); }}
      onDelete={async id => { const { error: e } = await deleteService(id); if (!e) setItems(p => p.filter(i => i.id !== id)); }}
      onToggle={async (id, val) => { const { error: e } = await updateService(id, { active: val }); if (!e) setItems(p => p.map(i => i.id === id ? { ...i, active: val } : i)); }}
      onRefresh={load}
    />
  );
}
