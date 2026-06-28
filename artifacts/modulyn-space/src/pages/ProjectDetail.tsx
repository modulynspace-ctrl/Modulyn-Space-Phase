import React, { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import { fetchPublicProjectBySlug } from "@/lib/projectsApi";
import {
  Project, CATEGORY_LABELS,
  heroImage, beforeImage, afterImage, galleryImages,
} from "@/lib/projectTypes";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1400&q=80";

export default function ProjectDetail() {
  const { id: slug } = useParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    window.scrollTo(0, 0);

    fetchPublicProjectBySlug(slug).then(({ data, error: err }) => {
      setLoading(false);
      if (err) { setError(err); return; }
      setProject(data);
      if (data) {
        document.title = `${data.title} | Modulyn Space`;
      } else {
        document.title = "Project Not Found | Modulyn Space";
      }
    });
  }, [slug]);

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="w-full pt-20 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="w-full pt-20 min-h-screen flex flex-col items-center justify-center gap-6 text-center px-6">
        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-destructive" />
        </div>
        <div>
          <p className="font-serif text-2xl mb-2">Something went wrong</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <Link href="/projects" className="text-sm text-primary hover:underline">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────

  if (!project) {
    return (
      <div className="w-full pt-20 min-h-screen flex flex-col items-center justify-center gap-6 text-center px-6">
        <p className="font-serif text-3xl">Project Not Found</p>
        <p className="text-muted-foreground max-w-sm">
          This project may be private or may not exist yet.
        </p>
        <Link href="/projects" className="text-sm text-primary hover:underline">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  // ── Data derived from project ─────────────────────────────────────────────

  const hero    = heroImage(project);
  const before  = beforeImage(project);
  const after   = afterImage(project);
  const gallery = galleryImages(project);

  const heroUrl = hero?.url ?? FALLBACK_IMG;

  const details: Array<{ label: string; value: string | null }> = [
    { label: "Category",  value: CATEGORY_LABELS[project.category] },
    { label: "Location",  value: project.location },
    { label: "Client",    value: project.client_name },
    { label: "Area",      value: project.area_sqft ? `${project.area_sqft.toLocaleString("en-IN")} sq.ft` : null },
    { label: "Duration",  value: project.duration_months ? `${project.duration_months} month${project.duration_months === 1 ? "" : "s"}` : null },
    { label: "Budget",    value: project.budget_range },
  ].filter((d) => d.value);

  return (
    <div className="w-full pt-20">
      <div className="container mx-auto px-6 py-8">
        <Link
          href="/projects"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
        >
          <ChevronLeft size={16} className="mr-2" /> Back to Projects
        </Link>
      </div>

      {/* Hero Image */}
      <section className="w-full h-[60vh] md:h-[80vh] relative overflow-hidden">
        <img
          src={heroUrl}
          alt={project.title}
          className="w-full h-full object-cover"
        />
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

            {/* Main Content */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="font-serif text-4xl md:text-6xl mb-6">{project.title}</h1>
                <p className="text-xl text-muted-foreground font-light leading-relaxed mb-16">
                  {project.description ?? project.short_description ?? "A beautifully crafted space by Modulyn Space."}
                </p>

                {/* Before / After */}
                {(before || after) && (
                  <div className="mb-16">
                    <h3 className="font-serif text-2xl mb-8">Transformation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative aspect-[4/3] overflow-hidden border border-border">
                        {before ? (
                          <>
                            <img
                              src={before.url}
                              alt="Before"
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4 bg-background/80 backdrop-blur px-3 py-1 text-xs tracking-widest uppercase font-medium">
                              Before
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center">
                            <span className="text-muted-foreground tracking-widest uppercase text-sm font-medium">Before</span>
                          </div>
                        )}
                      </div>
                      <div className="relative aspect-[4/3] overflow-hidden border border-border">
                        {after ? (
                          <>
                            <img
                              src={after.url}
                              alt="After"
                              loading="lazy"
                              className="w-full h-full object-cover opacity-90"
                            />
                            <div className="absolute top-4 left-4 bg-background/80 backdrop-blur px-3 py-1 text-xs tracking-widest uppercase font-medium">
                              After
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center">
                            <span className="text-muted-foreground tracking-widest uppercase text-sm font-medium">After</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Gallery */}
                {gallery.length > 0 && (
                  <div>
                    <h3 className="font-serif text-2xl mb-8">Gallery</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {gallery.map((img, i) => (
                        <div
                          key={img.id}
                          className={`relative overflow-hidden ${
                            i === gallery.length - 1 && gallery.length % 2 !== 0
                              ? "md:col-span-2 aspect-[21/9]"
                              : "aspect-square"
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.alt_text ?? `Gallery ${i + 1}`}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-secondary p-8 md:p-10 sticky top-32"
              >
                <h3 className="font-serif text-2xl mb-8">Project Details</h3>
                <dl className="space-y-6">
                  {details.map(({ label, value }) => (
                    <div key={label} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <dt className="text-sm text-muted-foreground uppercase tracking-wider mb-1">{label}</dt>
                      <dd className="font-medium text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
