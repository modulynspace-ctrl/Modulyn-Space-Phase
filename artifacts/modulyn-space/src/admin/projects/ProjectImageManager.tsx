import React, { useRef, useState } from "react";
import {
  Upload, Trash2, Loader2, AlertCircle,
  GripVertical, Image as ImageIcon, CheckCircle2, Library,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectImage } from "@/lib/projectTypes";
import { MediaItem } from "@/lib/mediaTypes";
import {
  uploadProjectImage, deleteProjectImage,
  updateImageOrder, linkMediaToProject,
} from "@/lib/projectsApi";
import MediaPickerModal from "@/admin/media/MediaPickerModal";

// ── Types ─────────────────────────────────────────────────────────────────────

type SlotKey = "hero" | "before" | "after" | "gallery";

interface SingleUploadSlotProps {
  label:               string;
  image:               ProjectImage | undefined;
  onUpload:            (file: File) => Promise<void>;
  onDelete:            (img: ProjectImage) => Promise<void>;
  onPickFromLibrary:   () => void;
  uploading:           boolean;
  deleting:            boolean;
  error:               string | null;
}

// ── Single image slot (Hero / Before / After) ─────────────────────────────────

function SingleUploadSlot({
  label, image, onUpload, onDelete, onPickFromLibrary, uploading, deleting, error,
}: SingleUploadSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>

      {error && (
        <div className="flex items-start gap-2 text-destructive text-xs bg-destructive/10 px-3 py-2 rounded">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {image ? (
        <div className="relative group rounded-lg overflow-hidden border border-border bg-secondary aspect-video max-w-xs">
          <img
            src={image.url}
            alt={label}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-3 text-xs bg-white/90 hover:bg-white"
              onClick={() => inputRef.current?.click()}
              disabled={uploading || deleting}
              title="Upload a new file"
            >
              Replace
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-3 text-xs bg-white/90 hover:bg-white"
              onClick={onPickFromLibrary}
              disabled={uploading || deleting}
              title="Choose from Media Library"
            >
              <Library className="w-3 h-3 mr-1" /> Library
            </Button>
            <Button
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 bg-destructive/90 hover:bg-destructive text-white"
              onClick={() => onDelete(image)}
              disabled={uploading || deleting}
            >
              {deleting
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Trash2 className="w-3.5 h-3.5" />}
            </Button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full max-w-xs aspect-video border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (
              <>
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Click to upload {label}</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onPickFromLibrary}
            disabled={uploading}
            className="text-xs text-muted-foreground hover:text-primary underline-offset-2 hover:underline disabled:opacity-50 transition-colors flex items-center gap-1"
          >
            <Library className="w-3 h-3" /> or choose from Media Library
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

// ── Gallery item ──────────────────────────────────────────────────────────────

interface GalleryItemProps {
  image:       ProjectImage;
  index:       number;
  dragIndex:   number | null;
  onDragStart: (i: number) => void;
  onDrop:      (i: number) => void;
  onDragEnd:   () => void;
  onDelete:    (img: ProjectImage) => void;
  deleting:    boolean;
}

function GalleryItem({
  image, index, dragIndex,
  onDragStart, onDrop, onDragEnd, onDelete, deleting,
}: GalleryItemProps) {
  const isDragging = dragIndex === index;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); }}
      onDrop={(e) => { e.preventDefault(); onDrop(index); }}
      onDragEnd={onDragEnd}
      className={`relative group rounded-lg overflow-hidden border border-border bg-secondary aspect-square transition-all ${
        isDragging ? "opacity-40 scale-95" : "opacity-100"
      }`}
    >
      <img
        src={image.url}
        alt={`Gallery ${index + 1}`}
        loading="lazy"
        className="w-full h-full object-cover"
      />
      <div className="absolute top-1.5 left-1.5 p-1 bg-black/40 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical className="w-3.5 h-3.5 text-white" />
      </div>
      <button
        type="button"
        onClick={() => onDelete(image)}
        disabled={deleting}
        className="absolute top-1.5 right-1.5 p-1 bg-black/40 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/80 text-white disabled:opacity-50"
        title="Remove image"
      >
        {deleting
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  projectId:      string;
  initialImages:  ProjectImage[];
  onImagesChange: (images: ProjectImage[]) => void;
}

export default function ProjectImageManager({
  projectId, initialImages, onImagesChange,
}: Props) {
  const [images, setImages] = useState<ProjectImage[]>(initialImages);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [deleting,  setDeleting]  = useState<Record<string, boolean>>({});
  const [errors,    setErrors]    = useState<Record<string, string | null>>({});
  const [saveOrderMsg, setSaveOrderMsg] = useState<string | null>(null);

  const [dragIndex,     setDragIndex]     = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<ProjectImage[]>(
    () => initialImages
      .filter((i) => !i.is_hero && !i.is_before && !i.is_after)
      .sort((a, b) => a.sort_order - b.sort_order)
  );

  // Media picker state
  const [pickerOpen,   setPickerOpen]   = useState(false);
  const [pickerTarget, setPickerTarget] = useState<SlotKey | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);

  const heroImg   = images.find((i) => i.is_hero);
  const beforeImg = images.find((i) => i.is_before);
  const afterImg  = images.find((i) => i.is_after);

  function setUploadingFor(key: string, val: boolean) {
    setUploading((prev) => ({ ...prev, [key]: val }));
  }
  function setDeletingFor(key: string, val: boolean) {
    setDeleting((prev) => ({ ...prev, [key]: val }));
  }
  function setErrorFor(key: string, msg: string | null) {
    setErrors((prev) => ({ ...prev, [key]: msg }));
  }
  function mergeImages(newImg: ProjectImage) {
    setImages((prev) => [...prev.filter((i) => i.id !== newImg.id), newImg]);
  }
  function removeImage(id: string) {
    setImages((prev) => prev.filter((i) => i.id !== id));
  }

  // ── Single slot: upload file ───────────────────────────────────────────────

  async function handleSingleUpload(
    file: File,
    flags: { is_hero?: boolean; is_before?: boolean; is_after?: boolean },
    key: SlotKey
  ) {
    setUploadingFor(key, true);
    setErrorFor(key, null);
    const existing = images.find(
      (i) =>
        (flags.is_hero   && i.is_hero)   ||
        (flags.is_before && i.is_before) ||
        (flags.is_after  && i.is_after)
    );
    if (existing) {
      await deleteProjectImage(existing);
      removeImage(existing.id);
    }
    const { data, error } = await uploadProjectImage(projectId, file, flags);
    setUploadingFor(key, false);
    if (error) { setErrorFor(key, error); return; }
    if (data) {
      mergeImages(data);
      onImagesChange([...images.filter((i) => i.id !== existing?.id), data]);
    }
  }

  // ── Single slot: delete ────────────────────────────────────────────────────

  async function handleSingleDelete(image: ProjectImage, key: SlotKey) {
    setDeletingFor(key, true);
    setErrorFor(key, null);
    const { error } = await deleteProjectImage(image);
    setDeletingFor(key, false);
    if (error) { setErrorFor(key, error); return; }
    removeImage(image.id);
    onImagesChange(images.filter((i) => i.id !== image.id));
  }

  // ── Gallery: upload files ──────────────────────────────────────────────────

  async function handleGalleryFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (galleryInputRef.current) galleryInputRef.current.value = "";
    for (const file of files) {
      setUploadingFor("gallery", true);
      setErrorFor("gallery", null);
      const { data, error } = await uploadProjectImage(projectId, file, {});
      if (error) { setErrorFor("gallery", error); setUploadingFor("gallery", false); break; }
      if (data) {
        setGalleryImages((prev) => [...prev, data]);
        mergeImages(data);
      }
    }
    setUploadingFor("gallery", false);
  }

  // ── Gallery: delete ────────────────────────────────────────────────────────

  async function handleGalleryDelete(image: ProjectImage) {
    setDeletingFor(image.id, true);
    const { error } = await deleteProjectImage(image);
    setDeletingFor(image.id, false);
    if (error) { setErrorFor("gallery", error); return; }
    setGalleryImages((prev) => prev.filter((i) => i.id !== image.id));
    removeImage(image.id);
  }

  // ── Gallery: drag reorder ──────────────────────────────────────────────────

  function handleDrop(dropIdx: number) {
    if (dragIndex === null || dragIndex === dropIdx) return;
    setGalleryImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(dropIdx, 0, moved);
      updateImageOrder(next).then(({ error }) => {
        if (error) setSaveOrderMsg("Could not save order: " + error);
        else { setSaveOrderMsg("Order saved."); setTimeout(() => setSaveOrderMsg(null), 2500); }
      });
      return next;
    });
    setDragIndex(null);
  }

  // ── Media Library picker ───────────────────────────────────────────────────

  function openPicker(target: SlotKey) {
    setPickerTarget(target);
    setPickerOpen(true);
  }

  async function handlePickFromLibrary(media: MediaItem) {
    if (!pickerTarget) return;

    const key = pickerTarget;
    const flags = {
      is_hero:   key === "hero",
      is_before: key === "before",
      is_after:  key === "after",
    };

    if (key !== "gallery") {
      // Remove existing single-slot image first
      const existing = images.find(
        (i) =>
          (flags.is_hero   && i.is_hero)   ||
          (flags.is_before && i.is_before) ||
          (flags.is_after  && i.is_after)
      );
      if (existing) {
        await deleteProjectImage(existing);
        removeImage(existing.id);
      }
    }

    setUploadingFor(key, true);
    setErrorFor(key, null);

    const { data, error } = await linkMediaToProject(
      projectId,
      { url: media.url, alt_text: media.alt_text },
      key === "gallery" ? {} : flags
    );

    setUploadingFor(key, false);

    if (error) { setErrorFor(key, error); return; }
    if (data) {
      mergeImages(data);
      if (key === "gallery") {
        setGalleryImages((prev) => [...prev, data]);
      }
      onImagesChange([...images, data]);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-serif font-medium">Project Images</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Upload directly or choose from the Media Library. Supported: JPEG, PNG, WEBP, AVIF (max 10 MB).
        </p>
      </div>

      {/* ── Hero ── */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-5">Hero Image</h3>
        <SingleUploadSlot
          label="Hero"
          image={heroImg}
          uploading={!!uploading.hero}
          deleting={!!deleting.hero}
          error={errors.hero ?? null}
          onUpload={(file) => handleSingleUpload(file, { is_hero: true }, "hero")}
          onDelete={(img) => handleSingleDelete(img, "hero")}
          onPickFromLibrary={() => openPicker("hero")}
        />
      </div>

      {/* ── Before / After ── */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-5">Transformation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <SingleUploadSlot
            label="Before"
            image={beforeImg}
            uploading={!!uploading.before}
            deleting={!!deleting.before}
            error={errors.before ?? null}
            onUpload={(file) => handleSingleUpload(file, { is_before: true }, "before")}
            onDelete={(img) => handleSingleDelete(img, "before")}
            onPickFromLibrary={() => openPicker("before")}
          />
          <SingleUploadSlot
            label="After"
            image={afterImg}
            uploading={!!uploading.after}
            deleting={!!deleting.after}
            error={errors.after ?? null}
            onUpload={(file) => handleSingleUpload(file, { is_after: true }, "after")}
            onDelete={(img) => handleSingleDelete(img, "after")}
            onPickFromLibrary={() => openPicker("after")}
          />
        </div>
      </div>

      {/* ── Gallery ── */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Gallery ({galleryImages.length})
          </h3>
          <div className="flex items-center gap-2">
            {saveOrderMsg && (
              <span className={`text-xs flex items-center gap-1 ${saveOrderMsg.startsWith("Could") ? "text-destructive" : "text-emerald-600"}`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> {saveOrderMsg}
              </span>
            )}
            {errors.gallery && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.gallery}
              </span>
            )}
            <Button
              type="button" size="sm" variant="outline"
              className="gap-1.5 text-xs"
              onClick={() => openPicker("gallery")}
              disabled={!!uploading.gallery}
            >
              <Library className="w-3.5 h-3.5" /> Library
            </Button>
            <Button
              type="button" size="sm" variant="outline"
              className="gap-1.5 text-xs"
              onClick={() => galleryInputRef.current?.click()}
              disabled={!!uploading.gallery}
            >
              {uploading.gallery
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
                : <><Upload className="w-3.5 h-3.5" /> Add Images</>}
            </Button>
          </div>
        </div>

        {galleryImages.length === 0 ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={!!uploading.gallery}
              className="w-full border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 py-10 hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-50"
            >
              <ImageIcon className="w-7 h-7 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload gallery images</span>
              <span className="text-xs text-muted-foreground/60">Select multiple files at once</span>
            </button>
            <button
              type="button"
              onClick={() => openPicker("gallery")}
              className="text-xs text-muted-foreground hover:text-primary underline-offset-2 hover:underline flex items-center gap-1 transition-colors"
            >
              <Library className="w-3 h-3" /> or choose from Media Library
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {galleryImages.map((img, idx) => (
              <GalleryItem
                key={img.id}
                image={img}
                index={idx}
                dragIndex={dragIndex}
                onDragStart={setDragIndex}
                onDrop={handleDrop}
                onDragEnd={() => setDragIndex(null)}
                onDelete={handleGalleryDelete}
                deleting={!!deleting[img.id]}
              />
            ))}
            {/* Add more tile */}
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={!!uploading.gallery}
              className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-50"
            >
              {uploading.gallery
                ? <Loader2 className="w-5 h-5 animate-spin text-primary" />
                : <><Upload className="w-5 h-5 text-muted-foreground" /><span className="text-xs text-muted-foreground">Add</span></>}
            </button>
          </div>
        )}

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={handleGalleryFiles}
        />

        {galleryImages.length > 1 && (
          <p className="text-xs text-muted-foreground mt-3">
            Drag images to reorder. Order is saved automatically.
          </p>
        )}
      </div>

      {/* ── Media Library Picker ── */}
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => { setPickerOpen(false); setPickerTarget(null); }}
        onSelect={handlePickFromLibrary}
        defaultBucket="projects"
        title={
          pickerTarget === "hero"    ? "Choose Hero Image" :
          pickerTarget === "before"  ? "Choose Before Image" :
          pickerTarget === "after"   ? "Choose After Image" :
          pickerTarget === "gallery" ? "Add to Gallery" :
          "Choose from Media Library"
        }
      />
    </div>
  );
}
