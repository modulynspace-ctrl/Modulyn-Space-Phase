import React, { useEffect, useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { fetchPublicProjects } from "@/lib/projectsApi";
import { Project, CATEGORY_LABELS, ProjectCategory, heroImage } from "@/lib/projectTypes";

// ── Helpers ───────────────────────────────────────────────────────────────────

const FALLBACK_IMG = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80";

function getPublicLabel(category: ProjectCategory): string {
  const map: Record<ProjectCategory, string> = {
    home_interior:  "Home Interior",
    modular_kitchen:"Kitchen",
    wardrobe:       "Wardrobe",
    turnkey:        "Turnkey",
    renovation:     "Renovation",
    commercial:     "Commercial",
    furniture:      "Furniture",
    false_ceiling:  "False Ceiling",
    electrical:     "Electrical",
    landscape:      "Landscape",
  };
  return map[category] ?? CATEGORY_LABELS[category];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [filter,   setFilter]   = useState<"All" | ProjectCategory>("All");

  useEffect(() => {
    document.title = "Our Work | Modulyn Space";
    fetchPublicProjects().then(({ data, error: err }) => {
      setLoading(false);
      if (err) { setError(err); return; }
      setProjects(data);
    });
  }, []);

  // Derive unique categories from fetched data (preserves DB order)
  const categories = useMemo<Array<"All" | ProjectCategory>>(() => {
    const seen = new Set<ProjectCategory>();
    projects.forEach((p) => seen.add(p.category));
    return ["All", ...Array.from(seen)];
  }, [projects]);

  const filtered = useMemo(() =>
    filter === "All" ? projects : projects.filter((p) => p.category === filter),
    [projects, filter]
  );

  return (
    <div className="w-full pt-20">
      {/* Header */}
      <section className="py-20 md:py-32 bg-secondary">
        <div className="container mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-5xl md:text-7xl mb-6 text-foreground"
          >
            Our Work
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            A curated selection of our finest residential and commercial spaces across Karnataka.
          </motion.p>
        </div>
      </section>

      {/* Filters — only shown when there's more than one category */}
      {!loading && !error && categories.length > 2 && (
        <section className="py-8 border-b border-border bg-background sticky top-20 z-40">
          <div className="container mx-auto px-6 flex items-center justify-center flex-wrap gap-4 md:gap-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`text-sm tracking-wide uppercase transition-colors pb-1 border-b-2 ${
                  filter === cat
                    ? "border-primary text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat === "All" ? "All" : getPublicLabel(cat as ProjectCategory)}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-24 bg-background min-h-[60vh]">
        <div className="container mx-auto px-6">

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-destructive" />
              </div>
              <div>
                <p className="font-medium mb-1">Could not load projects</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Please check back soon or contact us directly.
                </p>
              </div>
            </div>
          )}

          {/* Empty — no public projects yet */}
          {!loading && !error && projects.length === 0 && (
            <div className="text-center py-24 text-muted-foreground">
              Portfolio coming soon. Check back shortly.
            </div>
          )}

          {/* Grid */}
          {!loading && !error && filtered.length > 0 && (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((project) => {
                const hero = heroImage(project);
                const imgUrl = hero?.url ?? FALLBACK_IMG;
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    key={project.id}
                    className="group relative block overflow-hidden cursor-pointer"
                  >
                    <Link href={`/projects/${project.slug}`}>
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <img
                          src={imgUrl}
                          alt={project.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-center justify-center">
                          <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 flex items-center gap-2 text-white font-medium tracking-wide uppercase text-sm">
                            View Project <ArrowRight size={16} />
                          </div>
                        </div>
                      </div>
                      <div className="mt-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-serif text-2xl group-hover:text-primary transition-colors">
                            {project.title}
                          </h3>
                          <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase ml-4 shrink-0">
                            {getPublicLabel(project.category)}
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          {project.location ?? "Karnataka"}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {!loading && !error && projects.length > 0 && filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              No projects found in this category.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
