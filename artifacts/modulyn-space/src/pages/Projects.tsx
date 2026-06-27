import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import project1 from "@assets/project-bedroom.png";
import project2 from "@assets/project-kitchen.png";
import project3 from "@assets/project-office.png";
import project4 from "@assets/project-dining.png";
import project5 from "@assets/hero-living-room.png";
import project6 from "@assets/project-featured.png";

const projects = [
  { id: 1, title: "The Artisan Villa", location: "Sadashivanagar", category: "Residential", image: project5 },
  { id: 2, title: "Minimalist Haven", location: "Indiranagar", category: "Apartment", image: project1 },
  { id: 3, title: "Culinary Elegance", location: "Jayanagar", category: "Kitchen", image: project2 },
  { id: 4, title: "Executive Suite", location: "UB City", category: "Commercial", image: project3 },
  { id: 5, title: "Modern Dining", location: "Koramangala", category: "Residential", image: project4 },
  { id: 6, title: "The Glass House", location: "Whitefield", category: "Villa", image: project6 },
];

const categories = ["All", "Residential", "Apartment", "Kitchen", "Commercial", "Villa"];

export default function Projects() {
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    document.title = "Our Work | Modulyn Space";
  }, []);

  const filteredProjects = filter === "All" ? projects : projects.filter(p => p.category === filter);

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

      {/* Filters */}
      <section className="py-8 border-b border-border bg-background sticky top-20 z-40">
        <div className="container mx-auto px-6 flex items-center justify-center flex-wrap gap-4 md:gap-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-sm tracking-wide uppercase transition-colors pb-1 border-b-2 ${
                filter === cat ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="py-24 bg-background min-h-[60vh]">
        <div className="container mx-auto px-6">
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                key={project.id}
                className="group relative block overflow-hidden cursor-pointer"
              >
                <Link href={`/projects/${project.id}`}>
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img 
                      src={project.image} 
                      alt={project.title}
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
                      <h3 className="font-serif text-2xl group-hover:text-primary transition-colors">{project.title}</h3>
                      <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">{project.category}</span>
                    </div>
                    <p className="text-muted-foreground">{project.location}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
          
          {filteredProjects.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              No projects found in this category.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
