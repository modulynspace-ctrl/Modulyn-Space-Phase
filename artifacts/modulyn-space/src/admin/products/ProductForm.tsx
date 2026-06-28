import React, { useRef, useState } from "react";
import {
  ArrowLeft, Loader2, AlertCircle, Upload, X, Library, ImageOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Product, ProductPayload, ProductCategory,
  CATEGORIES, CATEGORY_LABELS, generateSlug,
} from "@/lib/productsTypes";
import { MediaItem, isAllowedFile } from "@/lib/mediaTypes";
import { uploadMedia } from "@/lib/mediaApi";
import MediaPickerModal from "@/admin/media/MediaPickerModal";

interface Props {
  product?: Product;
  onSave:   (payload: ProductPayload) => Promise<{ error: string | null }>;
  onCancel: () => void;
}

export default function ProductForm({ product, onSave, onCancel }: Props) {
  const isEdit = !!product;

  // ── Form state ─────────────────────────────────────────────────────────────
  const [title,            setTitle]            = useState(product?.title            ?? "");
  const [slug,             setSlug]             = useState(product?.slug             ?? "");
  const [slugEdited,       setSlugEdited]        = useState(isEdit);
  const [category,         setCategory]         = useState<ProductCategory | "">(product?.category ?? "");
  const [description,      setDescription]      = useState(product?.description      ?? "");
  const [material,         setMaterial]         = useState(product?.material         ?? "");
  const [finish,           setFinish]           = useState(product?.finish           ?? "");
  const [dimensions,       setDimensions]       = useState(product?.dimensions       ?? "");
  const [priceMin,         setPriceMin]         = useState(product?.price_range_min?.toString() ?? "");
  const [priceMax,         setPriceMax]         = useState(product?.price_range_max?.toString() ?? "");
  const [deliveryTimeline, setDeliveryTimeline] = useState(product?.delivery_timeline ?? "");
  const [featured,         setFeatured]         = useState(product?.featured         ?? false);
  const [active,           setActive]           = useState(product?.active           ?? true);

  // ── Image state ────────────────────────────────────────────────────────────
  const [imageUrl,     setImageUrl]     = useState(product?.image_url ?? "");
  const [pickerOpen,   setPickerOpen]   = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgError,     setImgError]     = useState<string | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  // ── Submit state ───────────────────────────────────────────────────────────
  const [saving,      setSaving]      = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slugEdited) setSlug(generateSlug(v));
  }

  function handleSlugChange(v: string) {
    setSlug(v.toLowerCase().replace(/[^a-z0-9-]/g, ""));
    setSlugEdited(true);
  }

  function handlePickImage(item: MediaItem) {
    setImageUrl(item.url);
  }

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (uploadRef.current) uploadRef.current.value = "";
    if (!isAllowedFile(file)) {
      setImgError("Unsupported file type. Use JPG, PNG, WEBP, or AVIF.");
      return;
    }
    setImgUploading(true);
    setImgError(null);
    const { data, error: err } = await uploadMedia(file, "products");
    setImgUploading(false);
    if (err) { setImgError(err); return; }
    if (data) setImageUrl(data.url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!title.trim())   { setSubmitError("Product name is required.");  return; }
    if (!slug.trim())    { setSubmitError("Slug is required.");           return; }
    if (!category)       { setSubmitError("Category is required.");       return; }

    setSaving(true);
    const result = await onSave({
      title:             title.trim(),
      slug:              slug.trim(),
      category:          category as ProductCategory,
      description:       description.trim()      || null,
      material:          material.trim()          || null,
      finish:            finish.trim()            || null,
      dimensions:        dimensions.trim()        || null,
      price_range_min:   priceMin ? parseInt(priceMin, 10) : null,
      price_range_max:   priceMax ? parseInt(priceMax, 10) : null,
      delivery_timeline: deliveryTimeline.trim()  || null,
      image_url:         imageUrl                 || null,
      featured,
      active,
      sort_order:        product?.sort_order ?? 0,
    });
    setSaving(false);
    if (result.error) setSubmitError(result.error);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="gap-2" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-serif font-medium">
            {isEdit ? "Edit Product" : "New Product"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">

          {/* ── Left column ── */}
          <div className="space-y-6">

            {/* Product Details */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-5">
              <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Product Details
              </h2>

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title">Product Name <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. The Alabaster Sofa"
                  className="border-border/60"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <Label htmlFor="slug">
                  Slug <span className="text-destructive">*</span>
                  <span className="text-xs text-muted-foreground font-normal ml-2">Auto-generated from name</span>
                </Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="e.g. the-alabaster-sofa"
                  className="border-border/60 font-mono text-sm"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as ProductCategory)}
                >
                  <SelectTrigger className="border-border/60">
                    <SelectValue placeholder="Select a category…" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the product…"
                  rows={4}
                  className="border-border/60 resize-none"
                />
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-5">
              <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Specifications
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="e.g. Italian Leather"
                    className="border-border/60"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="finish">Finish</Label>
                  <Input
                    id="finish"
                    value={finish}
                    onChange={(e) => setFinish(e.target.value)}
                    placeholder="e.g. Matte Lacquer"
                    className="border-border/60"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. W 220 × D 90 × H 75 cm"
                  className="border-border/60"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="delivery">Delivery Timeline</Label>
                <Input
                  id="delivery"
                  value={deliveryTimeline}
                  onChange={(e) => setDeliveryTimeline(e.target.value)}
                  placeholder="e.g. 8–12 weeks"
                  className="border-border/60"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-5">
              <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Pricing
              </h2>
              <p className="text-xs text-muted-foreground -mt-2">
                Leave both fields empty to show "Custom Quote".
              </p>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="priceMin">Minimum Price (₹)</Label>
                  <Input
                    id="priceMin"
                    type="number"
                    min="0"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder="e.g. 120000"
                    className="border-border/60"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="priceMax">Maximum Price (₹)</Label>
                  <Input
                    id="priceMax"
                    type="number"
                    min="0"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="e.g. 180000"
                    className="border-border/60"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-6">

            {/* Image */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Product Image
              </h2>

              {/* Preview */}
              <div className="aspect-square rounded-lg overflow-hidden border border-border bg-secondary relative">
                {imageUrl ? (
                  <>
                    <img
                      src={imageUrl}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="absolute top-2 right-2 p-1 bg-black/40 rounded hover:bg-destructive/70 text-white transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ImageOff className="w-8 h-8" />
                    <p className="text-xs">No image set</p>
                  </div>
                )}
                {imgUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              {imgError && (
                <div className="flex items-start gap-2 text-destructive text-xs bg-destructive/10 px-3 py-2 rounded">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {imgError}
                </div>
              )}

              {/* Image actions */}
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 justify-center"
                  onClick={() => setPickerOpen(true)}
                >
                  <Library className="w-4 h-4" /> Choose from Library
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 justify-center"
                  onClick={() => uploadRef.current?.click()}
                  disabled={imgUploading}
                >
                  {imgUploading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                    : <><Upload className="w-4 h-4" /> Upload New</>}
                </Button>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="text-xs text-destructive hover:underline underline-offset-2 text-center"
                  >
                    Remove image
                  </button>
                )}
              </div>

              <input
                ref={uploadRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={handleImageFile}
              />
            </div>

            {/* Settings */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-5">
              <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Visibility
              </h2>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Visible on the public Store</p>
                </div>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Featured</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Highlighted in catalogue</p>
                </div>
                <Switch checked={featured} onCheckedChange={setFeatured} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        {submitError && (
          <div className="flex items-start gap-2 text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg mt-6">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {submitError}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-28"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{isEdit ? "Saving…" : "Creating…"}</>
              : isEdit ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </form>

      {/* Media Library picker */}
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePickImage}
        defaultBucket="products"
        title="Choose Product Image"
      />
    </div>
  );
}
