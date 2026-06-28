import React, { useMemo, useState } from "react";
import {
  Plus, Pencil, Trash2, Loader2, AlertCircle,
  RefreshCw, Star, Search, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Product, CATEGORIES, CATEGORY_LABELS, formatPriceRange,
} from "@/lib/productsTypes";

const PAGE_SIZE = 20;

interface Props {
  products:  Product[];
  loading:   boolean;
  error:     string | null;
  onAdd:     () => void;
  onEdit:    (product: Product) => void;
  onDelete:  (id: string) => Promise<void>;
  onToggle:  (id: string, field: "active" | "featured", value: boolean) => Promise<void>;
  onRefresh: () => void;
}

export default function ProductList({
  products, loading, error, onAdd, onEdit, onDelete, onToggle, onRefresh,
}: Props) {
  const [search,          setSearch]          = useState("");
  const [categoryFilter,  setCategoryFilter]  = useState("all");
  const [activeFilter,    setActiveFilter]    = useState("all");
  const [featuredFilter,  setFeaturedFilter]  = useState("all");
  const [page,            setPage]            = useState(1);
  const [deleteTarget,    setDeleteTarget]    = useState<Product | null>(null);
  const [deleting,        setDeleting]        = useState(false);
  const [deleteError,     setDeleteError]     = useState<string | null>(null);
  const [toggling,        setToggling]        = useState<string | null>(null);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = products;
    const q = search.trim().toLowerCase();
    if (q) result = result.filter((p) => p.title.toLowerCase().includes(q) || p.slug.includes(q));
    if (categoryFilter !== "all") result = result.filter((p) => p.category === categoryFilter);
    if (activeFilter   === "active")   result = result.filter((p) =>  p.active);
    if (activeFilter   === "inactive") result = result.filter((p) => !p.active);
    if (featuredFilter === "featured")    result = result.filter((p) =>  p.featured);
    if (featuredFilter === "notfeatured") result = result.filter((p) => !p.featured);
    return result;
  }, [products, search, categoryFilter, activeFilter, featuredFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when filters change
  function updateSearch(v: string)         { setSearch(v);          setPage(1); }
  function updateCategory(v: string)       { setCategoryFilter(v);  setPage(1); }
  function updateActive(v: string)         { setActiveFilter(v);    setPage(1); }
  function updateFeatured(v: string)       { setFeaturedFilter(v);  setPage(1); }

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleToggle(id: string, field: "active" | "featured", value: boolean) {
    setToggling(`${id}-${field}`);
    await onToggle(id, field, value);
    setToggling(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    await onDelete(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif font-medium mb-1">Store Products</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${products.length} product${products.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={onAdd} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white border border-border rounded-xl px-5 py-4 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-44">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products…"
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            className="pl-9 h-9 border-border/60"
          />
        </div>
        <Select value={categoryFilter} onValueChange={updateCategory}>
          <SelectTrigger className="w-36 h-9 text-sm border-border/60">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={activeFilter} onValueChange={updateActive}>
          <SelectTrigger className="w-32 h-9 text-sm border-border/60">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={featuredFilter} onValueChange={updateFeatured}>
          <SelectTrigger className="w-36 h-9 text-sm border-border/60">
            <SelectValue placeholder="Featured" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="notfeatured">Not Featured</SelectItem>
          </SelectContent>
        </Select>
        {filtered.length !== products.length && (
          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} of {products.length} shown
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-white border border-border rounded-xl flex flex-col items-center justify-center min-h-48 gap-4 p-8 text-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <div>
            <p className="font-medium mb-1">Could not load products</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh}>Try again</Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && products.length === 0 && (
        <div className="bg-white border border-border rounded-xl flex flex-col items-center justify-center min-h-64 gap-4 p-8 text-center">
          <p className="text-muted-foreground text-sm">No products yet. Add your first product to get started.</p>
          <Button onClick={onAdd} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      )}

      {/* No results */}
      {!loading && !error && products.length > 0 && filtered.length === 0 && (
        <div className="bg-white border border-border rounded-xl py-16 text-center">
          <p className="text-muted-foreground text-sm">No products match the current filters.</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && paginated.length > 0 && (
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-14">Image</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Active</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Featured</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Added</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map((product) => {
                  const toggleKey = (f: string) => `${product.id}-${f}`;
                  return (
                    <tr key={product.id} className="hover:bg-secondary/20 transition-colors">
                      {/* Image */}
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 rounded overflow-hidden bg-secondary border border-border shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.title}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-[10px]">
                              No img
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Product */}
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-medium text-foreground truncate">{product.title}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{product.slug}</p>
                        {product.material && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{product.material}</p>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary border border-border text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                          {CATEGORY_LABELS[product.category]}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {formatPriceRange(product.price_range_min, product.price_range_max)}
                      </td>

                      {/* Active toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(product.id, "active", !product.active)}
                          disabled={toggling === toggleKey("active")}
                          className="relative inline-flex items-center"
                          title={product.active ? "Active — click to deactivate" : "Inactive — click to activate"}
                        >
                          {toggling === toggleKey("active") ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          ) : (
                            <div
                              className={`w-9 h-5 rounded-full transition-colors relative ${
                                product.active ? "bg-emerald-500" : "bg-border"
                              }`}
                            >
                              <div
                                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                                  product.active ? "translate-x-4" : "translate-x-0.5"
                                }`}
                              />
                            </div>
                          )}
                        </button>
                      </td>

                      {/* Featured toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(product.id, "featured", !product.featured)}
                          disabled={toggling === toggleKey("featured")}
                          title={product.featured ? "Featured — click to unfeature" : "Not featured — click to feature"}
                        >
                          {toggling === toggleKey("featured") ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Star
                              className={`w-4 h-4 transition-colors ${
                                product.featured ? "fill-amber-400 text-amber-400" : "text-muted-foreground hover:text-amber-400"
                              }`}
                            />
                          )}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(product.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost" size="sm" className="h-8 w-8 p-0"
                            onClick={() => onEdit(product)} title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => { setDeleteTarget(product); setDeleteError(null); }}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="sm" className="h-7 w-7 p-0"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce<(number | "…")[]>((acc, n, i, arr) => {
                if (i > 0 && arr[i - 1] !== n - 1) acc.push("…");
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === "…" ? (
                  <span key={`e${i}`} className="px-1 text-xs">…</span>
                ) : (
                  <Button
                    key={n}
                    variant={page === n ? "default" : "outline"}
                    size="sm"
                    className={`h-7 w-7 p-0 text-xs ${page === n ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => setPage(n as number)}
                  >
                    {n}
                  </Button>
                )
              )}
            <Button
              variant="outline" size="sm" className="h-7 w-7 p-0"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v && !deleting) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the product from the store. The product image in the Media Library is not deleted and can be reused.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? <><Loader2 className="w-4 h-4 animate-spin mr-2 inline" />Deleting…</> : "Delete Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
