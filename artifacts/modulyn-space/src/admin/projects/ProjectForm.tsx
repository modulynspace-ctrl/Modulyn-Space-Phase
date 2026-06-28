import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Form, FormControl, FormDescription, FormField,
  FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Project, ProjectCategory, ProjectStatus,
  CATEGORY_LABELS, STATUS_LABELS,
  ALL_CATEGORIES, ALL_STATUSES,
  generateSlug,
} from "@/lib/projectTypes";
import { createProject, updateProject } from "@/lib/projectsApi";

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  title:             z.string().min(2, "Title must be at least 2 characters."),
  slug:              z.string()
    .min(2, "Slug is required.")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens."),
  category:          z.string().min(1, "Category is required."),
  status:            z.string().min(1, "Status is required."),
  featured:          z.boolean().default(false),
  short_description: z.string().optional(),
  description:       z.string().optional(),
  location:          z.string().optional(),
  area_sqft:         z.string().optional(),
  duration_months:   z.string().optional(),
  budget_range:      z.string().optional(),
  client_name:       z.string().optional(),
  sort_order:        z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  project?:  Project;
  onSave:    (saved: Project) => void;
  onCancel:  () => void;
}

function toFormValues(p?: Project): FormValues {
  return {
    title:             p?.title             ?? "",
    slug:              p?.slug              ?? "",
    category:          p?.category          ?? "",
    status:            p?.status            ?? "draft",
    featured:          p?.featured          ?? false,
    short_description: p?.short_description ?? "",
    description:       p?.description       ?? "",
    location:          p?.location          ?? "",
    area_sqft:         p?.area_sqft         != null ? String(p.area_sqft)       : "",
    duration_months:   p?.duration_months   != null ? String(p.duration_months) : "",
    budget_range:      p?.budget_range      ?? "",
    client_name:       p?.client_name       ?? "",
    sort_order:        p?.sort_order        != null ? String(p.sort_order)       : "0",
  };
}

export default function ProjectForm({ project, onSave, onCancel }: Props) {
  const isEdit = !!project;

  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [slugLocked, setSlugLocked] = useState(isEdit);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(project),
  });

  // Auto-generate slug from title (create mode only, until user manually edits)
  const watchedTitle = form.watch("title");
  useEffect(() => {
    if (!slugLocked) {
      form.setValue("slug", generateSlug(watchedTitle), { shouldValidate: false });
    }
  }, [watchedTitle, slugLocked, form]);

  async function onSubmit(values: FormValues) {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const payload = {
      title:             values.title,
      slug:              values.slug,
      category:          values.category as ProjectCategory,
      status:            values.status  as ProjectStatus,
      featured:          values.featured,
      short_description: values.short_description?.trim() || null,
      description:       values.description?.trim()       || null,
      location:          values.location?.trim()          || null,
      area_sqft:         values.area_sqft       ? parseInt(values.area_sqft, 10)       : null,
      duration_months:   values.duration_months ? parseInt(values.duration_months, 10) : null,
      budget_range:      values.budget_range?.trim()  || null,
      client_name:       values.client_name?.trim()   || null,
      sort_order:        values.sort_order ? parseInt(values.sort_order, 10) : 0,
    };

    if (isEdit) {
      const { error } = await updateProject(project.id, payload);
      setSaving(false);
      if (error) { setSaveError(error); return; }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onSave({ ...project, ...payload });
    } else {
      const { data, error } = await createProject(payload);
      setSaving(false);
      if (error) { setSaveError(error); return; }
      if (data) onSave(data);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onCancel} className="gap-2 text-muted-foreground">
          <ChevronLeft className="w-4 h-4" /> Back to Projects
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-serif font-medium mb-1">
          {isEdit ? `Edit: ${project.title}` : "Add New Project"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isEdit ? "Update project details below." : "Fill in the details to create a new project."}
        </p>
      </div>

      {/* Success / Error */}
      {saveSuccess && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-4 py-3 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> Project saved successfully.
        </div>
      )}
      {saveError && (
        <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {saveError}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* ── Section: Basic Info ── */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="font-medium text-sm uppercase tracking-widest text-muted-foreground pb-2 border-b border-border/50">
              Basic Information
            </h2>

            {/* Title */}
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="The Artisan Villa" disabled={saving} className="border-border/60" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Slug */}
            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem>
                <FormLabel>Slug <span className="text-destructive">*</span></FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder="the-artisan-villa"
                      disabled={saving}
                      className="border-border/60 font-mono text-sm"
                      {...field}
                      onChange={(e) => {
                        setSlugLocked(true);
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  {slugLocked && !isEdit && (
                    <Button
                      type="button" variant="outline" size="sm" className="shrink-0"
                      onClick={() => { setSlugLocked(false); form.setValue("slug", generateSlug(form.getValues("title"))); }}
                    >
                      Reset
                    </Button>
                  )}
                </div>
                <FormDescription className="text-xs">
                  Used in the URL: /projects/<strong>{form.watch("slug") || "your-slug"}</strong>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            {/* Category + Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={saving}>
                    <FormControl>
                      <SelectTrigger className="border-border/60">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ALL_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={saving}>
                    <FormControl>
                      <SelectTrigger className="border-border/60">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ALL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Short Description */}
            <FormField control={form.control} name="short_description" render={({ field }) => (
              <FormItem>
                <FormLabel>Short Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="A brief summary shown on the Projects grid…"
                    className="resize-none h-20 border-border/60"
                    disabled={saving}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Full Description */}
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detailed project story shown on the project detail page…"
                    className="resize-none h-36 border-border/60"
                    disabled={saving}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* ── Section: Project Details ── */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="font-medium text-sm uppercase tracking-widest text-muted-foreground pb-2 border-b border-border/50">
              Project Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Whitefield, Bengaluru" disabled={saving} className="border-border/60" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="client_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Private Residential" disabled={saving} className="border-border/60" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="area_sqft" render={({ field }) => (
                <FormItem>
                  <FormLabel>Area (sq ft)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="2400" disabled={saving} className="border-border/60" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="duration_months" render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (months)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" placeholder="4" disabled={saving} className="border-border/60" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="budget_range" render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Range</FormLabel>
                  <FormControl>
                    <Input placeholder="₹30L – ₹50L" disabled={saving} className="border-border/60" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="sort_order" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="0" disabled={saving} className="border-border/60" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">Lower = appears first on the public site.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          {/* ── Section: Settings ── */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="font-medium text-sm uppercase tracking-widest text-muted-foreground pb-2 border-b border-border/50">
              Settings
            </h2>

            <FormField control={form.control} name="featured" render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4">
                <div>
                  <FormLabel className="text-base">Featured Project</FormLabel>
                  <FormDescription className="text-xs mt-0.5">
                    Featured projects are highlighted on the homepage.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={saving}
                  />
                </FormControl>
              </FormItem>
            )} />
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving} className="flex-1 max-w-[140px]">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 max-w-[200px] bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Saving…</span>
              ) : isEdit ? "Save Changes" : "Create Project"}
            </Button>
          </div>

        </form>
      </Form>
    </div>
  );
}
