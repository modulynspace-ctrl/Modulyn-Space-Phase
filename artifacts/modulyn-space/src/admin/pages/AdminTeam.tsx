import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus, Pencil, Trash2, Loader2, AlertCircle, RefreshCw,
  Search, ChevronLeft, ChevronRight, ArrowLeft,
  Upload, X, Library, ImageOff,
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
  TeamMember, TeamMemberPayload,
  fetchAdminTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember,
} from "@/lib/teamApi";
import { MediaItem, isAllowedFile } from "@/lib/mediaTypes";
import { uploadMedia } from "@/lib/mediaApi";
import MediaPickerModal from "@/admin/media/MediaPickerModal";

const PAGE_SIZE = 20;

// ── List ──────────────────────────────────────────────────────────────────────

interface ListProps {
  items: TeamMember[]; loading: boolean; error: string | null;
  onAdd: () => void; onEdit: (m: TeamMember) => void;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string, val: boolean) => Promise<void>;
  onRefresh: () => void;
}

function TeamList({ items, loading, error, onAdd, onEdit, onDelete, onToggle, onRefresh }: ListProps) {
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);
  const [delTarget, setDel]     = useState<TeamMember | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? items.filter(i => i.name.toLowerCase().includes(q) || i.role.toLowerCase().includes(q)) : items;
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function confirmDelete() {
    if (!delTarget) return;
    setDeleting(true);
    await onDelete(delTarget.id);
    setDeleting(false); setDel(null);
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
          <h1 className="text-3xl font-serif font-medium mb-1">Team</h1>
          <p className="text-sm text-muted-foreground">{loading ? "Loading…" : `${items.length} member${items.length !== 1 ? "s" : ""}`}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={onAdd} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Add Member
          </Button>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl px-5 py-4 flex gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or role…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9 border-border/60" />
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
          <p className="text-sm text-muted-foreground mb-4">No team members yet.</p>
          <Button onClick={onAdd} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="w-4 h-4" /> Add Member</Button>
        </div>
      )}
      {!loading && !error && paged.length > 0 && (
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-14">Photo</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Bio</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground w-20">Sort</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground w-24">Active</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.map(m => (
                <tr key={m.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary border border-border">
                      {m.image_url
                        ? <img src={m.image_url} alt={m.name} loading="lazy" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-sm font-medium">{m.name[0]}</div>}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{m.role}</td>
                  <td className="px-4 py-3 max-w-xs"><p className="text-sm text-muted-foreground line-clamp-2">{m.bio ?? "—"}</p></td>
                  <td className="px-4 py-3 text-center text-sm text-muted-foreground">{m.sort_order}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleToggle(m.id, !m.active)} disabled={toggling === m.id} className="mx-auto block">
                      {toggling === m.id
                        ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        : <div className={`w-9 h-5 rounded-full relative ${m.active ? "bg-emerald-500" : "bg-border"}`}>
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${m.active ? "translate-x-4" : "translate-x-0.5"}`} />
                          </div>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(m)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDel(m)}><Trash2 className="w-3.5 h-3.5" /></Button>
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
            <AlertDialogTitle>Delete "{delTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone. Their profile photo in the Media Library will not be deleted.</AlertDialogDescription>
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
  item?: TeamMember;
  onSave: (p: TeamMemberPayload) => Promise<{ error: string | null }>;
  onCancel: () => void;
}

function TeamForm({ item, onSave, onCancel }: FormProps) {
  const isEdit = !!item;
  const [name,      setName]      = useState(item?.name       ?? "");
  const [role,      setRole]      = useState(item?.role       ?? "");
  const [bio,       setBio]       = useState(item?.bio        ?? "");
  const [imageUrl,  setImageUrl]  = useState(item?.image_url  ?? "");
  const [sort,      setSort]      = useState(item?.sort_order.toString() ?? "0");
  const [active,    setActive]    = useState(item?.active     ?? true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgErr,    setImgErr]    = useState<string | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState<string | null>(null);

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (uploadRef.current) uploadRef.current.value = "";
    if (!isAllowedFile(file)) { setImgErr("Use JPG, PNG, WEBP, or AVIF."); return; }
    setImgUploading(true); setImgErr(null);
    const { data, error: ue } = await uploadMedia(file, "team");
    setImgUploading(false);
    if (ue) { setImgErr(ue); return; }
    if (data) setImageUrl(data.url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setErr("Name is required."); return; }
    if (!role.trim()) { setErr("Role is required."); return; }
    setSaving(true);
    const result = await onSave({ name: name.trim(), role: role.trim(), bio: bio.trim() || null, image_url: imageUrl || null, sort_order: parseInt(sort, 10) || 0, active });
    setSaving(false);
    if (result.error) setErr(result.error);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="gap-2" onClick={onCancel}><ArrowLeft className="w-4 h-4" /> Back</Button>
        <h1 className="text-3xl font-serif font-medium">{isEdit ? "Edit Team Member" : "New Team Member"}</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label>Name <span className="text-destructive">*</span></Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rahul Sharma" className="border-border/60" />
              </div>
              <div className="space-y-1.5">
                <Label>Role <span className="text-destructive">*</span></Label>
                <Input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Lead Designer" className="border-border/60" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Bio</Label>
              <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={5} placeholder="A short biography…" className="border-border/60 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-5 pt-2 border-t border-border/50">
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" value={sort} onChange={e => setSort(e.target.value)} min="0" className="border-border/60" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Profile Photo</h2>
              <div className="aspect-square rounded-lg overflow-hidden border border-border bg-secondary relative">
                {imageUrl
                  ? <><img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setImageUrl("")} className="absolute top-2 right-2 p-1 bg-black/40 rounded hover:bg-destructive/70 text-white"><X className="w-4 h-4" /></button></>
                  : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageOff className="w-8 h-8" /></div>}
                {imgUploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>}
              </div>
              {imgErr && <p className="text-xs text-destructive">{imgErr}</p>}
              <div className="flex flex-col gap-2">
                <Button type="button" variant="outline" size="sm" className="w-full gap-2 justify-center" onClick={() => setPickerOpen(true)}><Library className="w-4 h-4" /> Choose from Library</Button>
                <Button type="button" variant="outline" size="sm" className="w-full gap-2 justify-center" onClick={() => uploadRef.current?.click()} disabled={imgUploading}>
                  {imgUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Upload className="w-4 h-4" /> Upload Photo</>}
                </Button>
                {imageUrl && <button type="button" onClick={() => setImageUrl("")} className="text-xs text-destructive hover:underline text-center">Remove photo</button>}
              </div>
              <input ref={uploadRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={handleImageFile} />
            </div>
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Visibility</h2>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Active</p><p className="text-xs text-muted-foreground">Show on website</p></div>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>
            </div>
          </div>
        </div>

        {err && <div className="flex items-start gap-2 text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg mt-6"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {err}</div>}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-28">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{isEdit ? "Saving…" : "Creating…"}</> : isEdit ? "Save Changes" : "Add Member"}
          </Button>
        </div>
      </form>

      <MediaPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(m: MediaItem) => setImageUrl(m.url)} defaultBucket="team" title="Choose Profile Photo" />
    </div>
  );
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

type Mode = "list" | "new" | "edit";

export default function AdminTeam() {
  const [mode,     setMode]     = useState<Mode>("list");
  const [editItem, setEditItem] = useState<TeamMember | null>(null);
  const [items,    setItems]    = useState<TeamMember[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error: err } = await fetchAdminTeamMembers();
    setLoading(false); setError(err);
    if (!err) setItems(data);
  }

  async function handleSave(payload: TeamMemberPayload) {
    if (editItem) {
      const r = await updateTeamMember(editItem.id, payload);
      if (!r.error) { setItems(p => p.map(i => i.id === editItem.id ? { ...editItem, ...payload, updated_at: new Date().toISOString() } : i)); setMode("list"); setEditItem(null); }
      return r;
    }
    const { data, error: err } = await createTeamMember(payload);
    if (!err && data) { setItems(p => [...p, data].sort((a, b) => a.sort_order - b.sort_order)); setMode("list"); }
    return { error: err };
  }

  if (mode !== "list") {
    return <TeamForm item={mode === "edit" ? (editItem ?? undefined) : undefined} onSave={handleSave} onCancel={() => { setMode("list"); setEditItem(null); }} />;
  }
  return (
    <TeamList items={items} loading={loading} error={error} onAdd={() => setMode("new")}
      onEdit={m => { setEditItem(m); setMode("edit"); }}
      onDelete={async id => { const { error: e } = await deleteTeamMember(id); if (!e) setItems(p => p.filter(i => i.id !== id)); }}
      onToggle={async (id, val) => { const { error: e } = await updateTeamMember(id, { active: val }); if (!e) setItems(p => p.map(i => i.id === id ? { ...i, active: val } : i)); }}
      onRefresh={load}
    />
  );
}
